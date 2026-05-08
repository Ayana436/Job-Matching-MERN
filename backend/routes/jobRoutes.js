import express from 'express';
import Job from '../models/Job.js';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

const router = express.Router();


// 1. Global Search (Already working)
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        let query = {};
        if (q) {
            const searchRegex = new RegExp(q, 'i');
            query = {
                $or: [
                    { title: searchRegex },
                    { location: searchRegex },
                    { requiredSkills: { $in: [searchRegex] } }
                ]
            };
        }
        const jobs = await Job.find(query).sort({ createdAt: -1 });
        res.status(200).json(jobs);
    } catch (err) {
        res.status(500).json({ error: 'Search failed' });
    }
});

// 2. SMART MATCHING (The Fix)
router.post('/match', async (req, res) => {
    try {
        const { resumeText } = req.body;
        if (!resumeText) return res.status(400).json({ error: "No text provided" });

        const allJobs = await Job.find();

        const matches = allJobs.map(job => {
            const matchedSkills = job.requiredSkills.filter(skill => {
                // This escapes special characters so 'Node.js' doesn't break the Regex
                const safeSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(safeSkill, 'i');
                return regex.test(resumeText);
            });

            const score = job.requiredSkills.length > 0 
                ? (matchedSkills.length / job.requiredSkills.length) * 100 
                : 0;

            return {
                _id: job._id,
                title: job.title,
                location: job.location,
                matchScore: Math.round(score),
                matchedSkills,
                missingSkills: job.requiredSkills.filter(s => !matchedSkills.includes(s))
            };
        });

        // Only return jobs that have at least one skill match (> 0%)
        const filteredMatches = matches
            .filter(m => m.matchScore > 0)
            .sort((a, b) => b.matchScore - a.score);

        res.status(200).json(filteredMatches);
    } catch (err) {
        res.status(500).json({ error: 'Matching failed' });
    }
});

// PDF UPLOAD FEATURE

// 1. POST a new job (For the Recruiter Form)
router.post('/add', async (req, res) => {
    try {
        const job = new Job(req.body);
        await job.save();
        res.status(201).json({ message: "Job posted successfully!" });
    } catch (err) {
        res.status(400).json({ error: "Failed to post job" });
    }
});

// 2. NEW: Match via PDF Upload
// 2. NEW: Match via PDF Upload
router.post('/match-pdf', async (req, res) => {
    try {
        if (!req.files || !req.files.resume) {
            return res.status(400).json({ error: "No file detected" });
        }

        const dataBuffer = new Uint8Array(req.files.resume.data);
        const loadingTask = pdfjs.getDocument({ data: dataBuffer, verbosity: 0 });
        const pdf = await loadingTask.promise;
        
        let resumeText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            resumeText += textContent.items.map(item => item.str).join(" ");
        }

        if (!resumeText) throw new Error("Could not extract text from PDF");

        const allJobs = await Job.find();
        const matches = allJobs.map(job => {
            const matchedSkills = job.requiredSkills.filter(skill => {
                const safeSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                return new RegExp(`\\b${safeSkill}\\b`, 'i').test(resumeText);
            });

            const score = job.requiredSkills.length > 0 
                ? (matchedSkills.length / job.requiredSkills.length) * 100 
                : 0;

            return {
                _id: job._id,
                title: job.title,
                location: job.location,
                matchScore: Math.round(score),
                matchedSkills
            };
        });

        res.status(200).json(matches.filter(m => m.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore));

    } catch (err) {
        console.error("PDF Parsing Error:", err);
        res.status(500).json({ error: "Server failed to process PDF" });
    }
});

export default router;