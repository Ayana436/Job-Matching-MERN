import express from 'express';
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import User from '../models/User.js'
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import ResumeHistory from '../models/ResumeHistory.js';
import sendEmail from '../utils/sendEmail.js';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { calculateSimilarity, preprocessText } from '../utils/nlpUtils.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { deleteResume } from '../controllers/userController.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '..');

// ---- MULTER - Storage Engine ----


// Ensure upload directory exists
const uploadDir = path.join(backendRoot, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {recursive: true});
}

// 1. Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// 2. File Filter (PDF only)
const fileFilter = (req, file, cb) => {
    const isPdf =
    file.mimetype === "application/pdf" &&
    path.extname(file.originalname).toLowerCase() === ".pdf";

    if (isPdf) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDFs are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 }
});


// --- HELPER FUNCTIONS ---
const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(String(id));

const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const getMatchSummary = (score, matchedSkills, missingSkills, query) => {
    if (score === 100) return "Perfect match. The resume aligns with all required skills.";
    if (score >= 70) return `Strong match. Found ${matchedSkills.length} core skills, including ${matchedSkills.slice(0, 2).join(', ')}.`;
    if (query) return `Search match for "${query}". This role has ${missingSkills.length} skills still to improve.`;
    return "Potential match. Improve skills in " + missingSkills.slice(0, 2).join(' and ') + ".";
};

const normalizeJobPayload = (body) => ({
    ...body,
    salary: body.salary || 'Negotiable',
    requiredSkills: Array.isArray(body.requiredSkills)
        ? body.requiredSkills.map(skill => String(skill).trim()).filter(Boolean)
        : String(body.requiredSkills || '').split(',').map(skill => skill.trim()).filter(Boolean)
});

// --- NEW: GET ALL JOBS (Base Route) ---
router.get('/', async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 }).lean();
        // We map them so the frontend always sees a 'matchScore' even if 0
        const processedJobs = jobs.map(job => ({
            ...job,
            matchScore: 0,
            aiSummary: "Upload a resume to see AI matching details."
        }));
        res.status(200).json(processedJobs);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

// --- 1. GLOBAL SEARCH ---
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        let query = {};
        const searchTerms = q
            ? q.split(',').map(term => term.trim()).filter(Boolean)
            : [];
        
        if (searchTerms.length > 0) {
            const searchRegexes = searchTerms.map((term) => {
                const safeQuery = escapeRegExp(term);
                return new RegExp(`(^|\\s|[\\W_])${safeQuery}($|\\s|[\\W_])`, 'i');
            });
            
            query = {
                $or: [
                    { title: { $in: searchRegexes } },
                    { location: { $in: searchRegexes } },
                    { requiredSkills: { $in: searchRegexes } },
                    { jobType: { $in: searchRegexes } },
                    { experienceLevel: { $in: searchRegexes } },
                    { salary: { $in: searchRegexes } }
                ]
            };
        }

        const jobs = await Job.find(query).sort({ createdAt: -1 }).lean();

        const processedJobs = jobs.map(job => {
            const matchRegexes = searchTerms.map((term) => {
                const safeQuery = escapeRegExp(term);
                return new RegExp(`(^|\\s|[\\W_])${safeQuery}($|\\s|[\\W_])`, 'i');
            });
            
            const matchedSkills = searchTerms.length > 0 ? job.requiredSkills.filter(skill =>
                matchRegexes.some((regex) => regex.test(skill))
            ) : [];

            const missingSkills = job.requiredSkills.filter(s => !matchedSkills.includes(s));
            const score = (searchTerms.length > 0 && job.requiredSkills.length > 0)
                ? Math.round((matchedSkills.length / job.requiredSkills.length) * 100) 
                : 0;

            return {
                ...job,
                aiSummary: getMatchSummary(score, matchedSkills, missingSkills, q),
                matchedSkills,
                matchScore: score
            };
        });

        res.status(200).json(processedJobs);
    } catch (err) {
        console.error("Search Error:", err);
        res.status(500).json({ error: 'Search failed' });
    }
});

// --- 2. PDF MATCHING ---
// Ensure you have these imports at the top of your file
// import fs from 'fs';
// import { upload } from './yourMulterConfig'; // or wherever you defined 'upload'

router.post('/match-pdf', protect, authorize('candidate'), upload.single('resume'), async (req, res) => {
    try {
        // 1. Check if Multer caught the file
        if (!req.file) {
            return res.status(400).json({ error: "Please upload a valid PDF file" });
        }

        // 2. Read the file from the disk path Multer created
        const dataBuffer = new Uint8Array(fs.readFileSync(req.file.path));
        
        const loadingTask = pdfjs.getDocument({ data: dataBuffer, verbosity: 0 });
        const pdf = await loadingTask.promise;
        
        let resumeText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            resumeText += textContent.items.map(item => item.str).join(" ");
        }

        const allJobs = await Job.find().lean();
        const matches = allJobs.map(job => {

        const requiredSkills = job.requiredSkills || [];

    // keyword skill matching
        const matchedSkills = requiredSkills.filter(skill => {

        const safeSkill = escapeRegExp(skill);

        const regex = new RegExp(
            `(^|\\s|[\\W_])${safeSkill}($|\\s|[\\W_])`,
            'i'
        );

        return regex.test(resumeText);
    });

        const missingSkills =
        requiredSkills.filter(
            skill => !matchedSkills.includes(skill)
        );

    // combine job fields into NLP text
        const jobContent = `
        ${job.title}
        ${job.description}
        ${requiredSkills.join(" ")}
        ${job.location}
        ${job.jobType}
        ${job.experienceLevel}
    `;

    // TF-IDF cosine similarity
        const similarityScore =
        calculateSimilarity(
            resumeText,
            jobContent
        );

    // weighted hybrid AI score
        const skillScore =
        requiredSkills.length > 0
            ? Math.round(
                (matchedSkills.length /
                      requiredSkills.length) * 100
            )
            : 0;

    // final AI score
        const finalScore = Math.round(
        (skillScore * 0.6) +
        (similarityScore * 0.4)
    );

    let rankingReason = "";

    if (finalScore >= 80) {
        rankingReason =
            "Excellent semantic and skill match.";
    } else if (finalScore >= 60) {
        rankingReason =
            "Strong candidate with relevant experience.";
    } else if (finalScore >= 40) {
        rankingReason =
            "Moderate relevance to job requirements.";
    } else {
        rankingReason =
            "Limited alignment with required profile.";
    }

    return {
        ...job,

        matchScore: finalScore,

        semanticScore: similarityScore,

        skillScore: skillScore,

        matchedSkills,

        missingSkills,

        rankingReason,

        aiSummary: getMatchSummary(
            finalScore,
            matchedSkills,
            missingSkills
        )
    };
});

        // 3. (Optional) Delete the file after processing to save space
        // fs.unlinkSync(req.file.path); 
        // saves latest resume, stores upload history, attaches resume to user profile
await User.findByIdAndUpdate(
    req.user.id,
    {
        resume: {
            fileName: req.file.originalname,
            filePath: `/uploads/${req.file.filename}`,
            uploadedAt: new Date()
        },

        $push: {
            resumeHistory: {
                fileName: req.file.originalname,
                filePath: `/uploads/${req.file.filename}`,
                uploadedAt: new Date()
            }
        }
    },
    { new: true }
);


const sortedMatches = matches
    .filter(m => m.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);


// SAVE RESUME HISTORY
const extractedSkills = [
    ...new Set(
        sortedMatches.flatMap(
            job => job.matchedSkills || []
        )
    )
];

await ResumeHistory.create({
    candidateId: req.user.id,
    fileName: req.file.originalname,
    filePath: `/uploads/${req.file.filename}`,
    uploadedAt: new Date(),
    extractedSkills,
    topMatchScore:
        sortedMatches[0]?.matchScore || 0,
    totalMatches: sortedMatches.length
});

res.status(200).json(sortedMatches);

    } catch (err) {
        console.error("PDF Parsing Error:", err);

        // // delete broken upload if needed
        // if (req.file?.path && fs.existsSync(req.file.path)) {
        //     fs.unlinkSync(req.file.path);
        // }

        return res.status(500).json({
            error: "Failed to process PDF"
})
}
});

// Delete uploaded pdf
router.delete('/resume/:historyId', protect, authorize('candidate'), deleteResume);
router.delete('/resume', protect, authorize('candidate'), deleteResume);

// --- 3. CRUD OPERATIONS ---
    // ONLY Recruiters can POST
router.post('/', protect, authorize('recruiter', 'admin'), async (req, res) => {
    try {
        const job = new Job(normalizeJobPayload(req.body));
        await job.save();
        res.status(201).json({ message: "Job posted successfully!", job });
    } catch (err) {
        console.error("Post Job Error:", err.message);
        res.status(400).json({ error: err.message || "Failed to post job" });
    }
});

    // ONLY Recruiters can DELETE
router.delete('/:id', protect, authorize('recruiter', 'admin'), async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: "Invalid job id" });
        }

        const deletedJob = await Job.findByIdAndDelete(req.params.id);

        if (!deletedJob) {
            return res.status(404).json({ error: "Job not found" });
        }

        res.json({ message: "Job deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Deletion failed" });
    }
});
    //  ONLY Recruiters can UPDATE
router.put('/:id', protect, authorize('recruiter', 'admin'), async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: "Invalid job id" });
        }

        const updatedJob = await Job.findByIdAndUpdate(
            req.params.id,
            normalizeJobPayload(req.body),
            { new: true, runValidators: true }
        );

        if (!updatedJob) {
            return res.status(404).json({ error: "Job not found" });
        }

        res.json({ message: "Job updated!", job: updatedJob });
    } catch (err) {
        console.error("Update Job Error:", err.message);
        res.status(400).json({ error: err.message || "Update failed" });
    }
});


// --- Route for Quick Apply (Candidate)---
router.post('/apply', protect, authorize('candidate'), async (req, res) => {
    try{
        // Ensure same as frontend:
    const { jobId, matchScore, candidateSkills } = req.body;
    const candidateId = req.user._id || req.user.id;

    if (!isValidObjectId(jobId)) {
        return res.status(400).json({ error: "Invalid job id" });
    }

    const jobExists = await Job.exists({ _id: jobId });

    if (!jobExists) {
        return res.status(404).json({ error: "Job not found" });
    }

    // 1. Check if already applied:
    const alreadyApplied = await Application.findOne({ 
        jobId: String(jobId), 
        candidateId: String(candidateId) 
    });
        if (alreadyApplied) {
            // use retrun to stop the function & prevent "headers already sent error"
            return res.status(200).json({ message: "You have already applied for this position.", alreadyApplied: true });
        }

        // 2. Create the application
        const newApp = new Application({ jobId, 
            candidateId,
            matchScore,       //saving the AI results
            candidateSkills  //saving the NLP results
        });
        await newApp.save();

        res.status(200).json({ message: "Application submitted successfully!" });
    }catch (err) {
        console.error("Apply Error:", err);
        // Ensure only 1 response is sent!
        if (!res.headersSent){
        return res.status(500).json({ error: "Server error during application." });
    }
}});

// Creates resume history API
router.get(
    '/resume-history',
    protect,
    authorize('candidate'),
    async (req, res) => {
        try {

            const history = await ResumeHistory.find({
                candidateId: req.user.id
            }).sort({ createdAt: -1 });

            res.status(200).json({
                history
            });

        } catch (err) {

            console.error(
                'Resume history error:',
                err
            );

            res.status(500).json({
                error:
                    'Failed to fetch resume history'
            });
        }
    }
);



// --- GET applications for a specific candidate ---
router.get('/my-applications/:candidateId', protect, async (req, res) => {
    try {
        const { candidateId } = req.params;

        if (!isValidObjectId(candidateId)) {
            return res.status(400).json({ error: "Invalid candidate id" });
        }

        if (req.user.role !== 'recruiter' && String(req.user.id) !== String(candidateId)) {
            return res.status(403).json({ error: "You can only view your own applications" });
        }

const applications = await Application.find({
    candidateId: candidateId
})
.populate({
    path: "candidateId",
    select: "name email resume"
})
.populate(
    'jobId',
    'title location company workMode'
)
.sort({ createdAt: -1 });
            
        res.status(200).json(applications);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch your applications" });
    }
});

// Pulls Score to send Recruiter
// Safer implementation blocking schema casting crashes
router.get('/applicants', protect, authorize('recruiter'), async (req, res) => {
    try {
        // Fetch raw application objects without processing population yet
        const rawApps = await Application.find().sort({ createdAt: -1 }).lean();

        // Dynamically populate documents to prevent CastErrors from dropping to catch()
        const apps = await Application.find()
            .populate({
                path: 'jobId',
                select: 'title location',
                options: { retainNullValues: true }
            })
            .populate({
                path: 'candidateId',
                select: 'name email',
                options: { retainNullValues: true }
            })
            .sort({ createdAt: -1 })
            .lean();

        // Strict validation: exclude broken, null, or malformed relational documents
        const validApps = apps.filter(app => {
            return app && 
                    app.jobId && 
                    typeof app.jobId === 'object' && 
                    app.candidateId && 
                    typeof app.candidateId === 'object';
        });

        res.set({
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
        });

        // Always log clean diagnostics in the terminal console to monitor operations
        console.log(`[Dashboard Sync] Raw Apps: ${apps.length} | Valid Filtered Apps: ${validApps.length}`);
        
        res.status(200).json(validApps);
    } catch (err) {
        console.error("Critical Backend Applicants Fetch Error:", err);
        // Fallback: return a clean 200 array instead of a 500 to keep the dashboard stable
        res.status(200).json([]); 
    }
});
// GET all applicants (Recruiter Only)

// Route to update application status (Approve/Reject)
router.patch(
    '/applicants/:id',
    protect,
    authorize('recruiter', 'admin'),

    async (req, res) => {

        try {

            const { id } = req.params;

            if (!isValidObjectId(id)) {
                return res.status(400).json({
                    error: "Invalid application id"
                });
            }

            const status =
    String(req.body.status || "").toLowerCase();

            if (!["pending", "reviewed", "accepted", "rejected"].includes(status)) {
                return res.status(400).json({
                    error: "Invalid application status"
                });
            }

            const updatedApplication =
                await Application.findByIdAndUpdate(

                    id,

                    { status },

                    { new: true, runValidators: true }

                )
                .populate(
                    'candidateId',
                    'name email'
                )
                .populate(
                    'jobId',
                    'title'
                );

            if (!updatedApplication) {

                return res.status(404).json({
                    error: "Application not found"
                });
            }

            const candidate =
                updatedApplication.candidateId;

            const job =
                updatedApplication.jobId;

            let emailSubject = "";
            let emailHtml = "";

            // ACCEPTED
            if (
                String(status).toLowerCase()
                === "accepted"
            ) {

                emailSubject =
                    "Application Accepted";

                emailHtml = `
                    <h2>
                        Congratulations ${candidate.name}
                    </h2>

                    <p>
                        Your application for
                        <b>${job.title}</b>
                        has been accepted.
                    </p>

                    <p>
                        The recruiter will contact you soon.
                    </p>
                `;
            }

            // REJECTED
            else if (
                String(status).toLowerCase()
                === "rejected"
            ) {

                emailSubject =
                    "Application Update";

                emailHtml = `
                    <h2>
                        Hello ${candidate.name}
                    </h2>

                    <p>
                        Thank you for applying for
                        <b>${job.title}</b>.
                    </p>

                    <p>
                        We appreciate your interest,
                        but another candidate was
                        selected for this role.
                    </p>

                    <p>
                        We encourage you to apply
                        again in future.
                    </p>
                `;
            }

            // SEND EMAIL
            if (candidate?.email && emailSubject) {

                await sendEmail({
                    to: candidate.email,
                    subject: emailSubject,
                    html: emailHtml
                });
            }

            res.status(200).json(
                updatedApplication
            );

        } catch (err) {

            console.error(
                "Status Update Error:",
                err
            );

            res.status(500).json({
                error:
                    "Server failed to update status"
            });
        }
    }
);

// DOWNLOAD RESUME
router.get(
    '/download-resume/:filename',
    protect,
    async (req, res) => {

        try {

            const filePath = path.join(
                backendRoot,
                'uploads',
                req.params.filename
            );

            if (!fs.existsSync(filePath)) {

                return res.status(404).json({
                    error: 'Resume not found'
                });
            }

            return res.sendFile(filePath);

        } catch (err) {

            console.error(
                'Resume view error:',
                err
            );

            res.status(500).json({
                error:
                    'Failed to open resume'
            });
        }
    }
);

// router.get(
//     "/debug-user", protect, async (req, res) => {
//         res.json({success: true, user: req.user});
//     });

export default router;
