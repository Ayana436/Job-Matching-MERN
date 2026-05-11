import express from 'express';
import Job from '../models/Job.js';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

const router = express.Router();

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
                    { requiredSkills: searchRegex }
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
router.post('/match-pdf', async (req, res) => {
    try {
        if (!req.files || !req.files.resume) return res.status(400).json({ error: "No file detected" });

        const dataBuffer = new Uint8Array(req.files.resume.data);
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

        res.status(200).json(matches.filter(m => m.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore));
    } catch (err) {
        console.error("PDF Parsing Error:", err);
        res.status(500).json({ error: "Server failed to process PDF" });
    }
});

// --- 3. CRUD OPERATIONS ---
router.post('/', async (req, res) => {
    try {
        const job = new Job(req.body);
        await job.save();
        res.status(201).json({ message: "Job posted successfully!", job });
    } catch (err) {
        res.status(400).json({ error: "Failed to post job" });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Job.findByIdAndDelete(req.params.id);
        res.json({ message: "Job deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Deletion failed" });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
        res.json({ message: "Job updated!", job: updatedJob });
    } catch (err) {
        res.status(400).json({ error: "Update failed" });
    }
});

export default router;