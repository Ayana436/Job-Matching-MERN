import express from 'express';
import multer from "multer";
import path from "path";
import fs from "fs";
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ---- MULTER - Storage Engine ----


// Ensure upload directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
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
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDFs are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // 5MB Limit
});


// --- HELPER FUNCTIONS ---
const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const getMatchSummary = (score, matchedSkills, missingSkills, query) => {
    if (score === 100) return "✨ Perfect match! Your profile aligns with all required skills.";
    if (score >= 70) return `🚀 Strong contender! You have ${matchedSkills.length} core skills, including ${matchedSkills.slice(0, 2).join(', ')}.`;
    if (query) return `🔍 Matches your interest in "${query}". This role requires ${missingSkills.length} more specific skills.`;
    return "💡 Potential match. Focus on gaining experience in " + missingSkills.slice(0, 2).join(' and ') + ".";
};

// --- 1. GLOBAL SEARCH ---
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        let query = {};
        
        if (q && q.trim() !== "") {
            const safeQuery = escapeRegExp(q.trim());
            // Strict boundaries: \b only works for alpha-numeric. 
            // We use a more robust check for special chars like C++
            const searchRegex = new RegExp(`(^|\\s|[\\W_])${safeQuery}($|\\s|[\\W_])`, 'i');
            
            query = {
                $or: [
                    { title: searchRegex },
                    { location: searchRegex },
                    { requiredSkills: searchRegex },
                    { jobType: searchRegex }, //finds Full time
                    { experienceLevel: searchRegex }  // finds Entry
                ]
            };
        }

        const jobs = await Job.find(query).sort({ createdAt: -1 }).lean();

        const processedJobs = jobs.map(job => {
            const safeQ = q ? escapeRegExp(q.trim()) : "";
            const matchRegex = new RegExp(`(^|\\s|[\\W_])${safeQ}($|\\s|[\\W_])`, 'i');
            
            const matchedSkills = q ? job.requiredSkills.filter(skill => 
                matchRegex.test(skill)
            ) : [];

            const missingSkills = job.requiredSkills.filter(s => !matchedSkills.includes(s));
            const score = (q && job.requiredSkills.length > 0) 
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

router.post('/match-pdf', upload.single('resume'), async (req, res) => {
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
            const matchedSkills = job.requiredSkills.filter(skill => {
                const safeSkill = escapeRegExp(skill);
                const regex = new RegExp(`(^|\\s|[\\W_])${safeSkill}($|\\s|[\\W_])`, 'i'); 
                return regex.test(resumeText);
            });

            const missingSkills = job.requiredSkills.filter(s => !matchedSkills.includes(s));
            const score = job.requiredSkills.length > 0 
                ? Math.round((matchedSkills.length / job.requiredSkills.length) * 100) 
                : 0;

            return {
                ...job,
                matchScore: score,
                matchedSkills,
                missingSkills,
                aiSummary: getMatchSummary(score, matchedSkills, missingSkills)
            };
        });

        // 3. (Optional) Delete the file after processing to save space
        // fs.unlinkSync(req.file.path); 

        const sortedMatches = matches
            .filter(m => m.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore);

        res.status(200).json(sortedMatches);
    } catch (err) {
        console.error("PDF Parsing Error:", err);
        // Clean up file even if parsing fails
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: "Server failed to process PDF" });
    }
});

// --- 3. CRUD OPERATIONS ---
// ONLY Recruiters can POST
router.post('/', protect, authorize('recruiter'), async (req, res) => {
    try {
        const job = new Job(req.body);
        await job.save();
        res.status(201).json({ message: "Job posted successfully!", job });
    } catch (err) {
        res.status(400).json({ error: "Failed to post job" });
    }
});

// ONLY Recruiters can DELETE
router.delete('/:id', protect, authorize('recruiter'), async (req, res) => {
    try {
        await Job.findByIdAndDelete(req.params.id);
        res.json({ message: "Job deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Deletion failed" });
    }
});
//  ONLY Recruiters can UPDATE
router.put('/:id', async (req, res) => {
    try {
        const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
        res.json({ message: "Job updated!", job: updatedJob });
    } catch (err) {
        res.status(400).json({ error: "Update failed" });
    }
});


// Route for Quick Apply
router.post('/apply', async (req, res) => {
    try{
        // Ensure same as frontend:
    const { jobId, candidateId } = req.body;

    // 1. Check if already applied:
    const alreadyApplied = await Application.findOne({ jobId, candidateId });
        if (alreadyApplied) {
            // use retrun to stop the function & prevent "headers already sent error"
            return res.status(200).json({ message: "You have already applied for this position.", alreadyApplied: true });
        }

        // 2. Create the application
        const newApp = new Application({ jobId, candidateId });
        await newApp.save();

        res.status(200).json({ message: "Application submitted successfully!" });
    }catch (err) {
        console.error("Apply Error:", err);
        // Ensure only 1 response is sent!
        if (!res.headersSent){
        return res.status(500).json({ error: "Server error during application." });
    }
}});

// GET all applicants (Recruiter Only)

// Route to update application status (Approve/Reject)
router.patch('/applicants/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Find the application and update its status field
        const updatedApplication = await Application.findByIdAndUpdate(
            id,
            { status: status },
            { new: true } // Returns the updated document
        );

        if (!updatedApplication) {
            return res.status(404).json({ error: "Application not found" });
        }

        res.status(200).json(updatedApplication);
    } catch (err) {
        console.error("Status Update Error:", err);
        res.status(500).json({ error: "Server failed to update status" });
    }
});

export default router;