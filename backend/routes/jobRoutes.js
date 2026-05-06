import express from 'express';
import Job from '../models/Job.js';

const router = express.Router();

// 1. CREATE a new job (Updated to include new fields)
router.post('/add', async (req, res) => {
    try {
        const newJob = new Job(req.body);
        const savedJob = await newJob.save();
        res.status(201).json(savedJob);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 2. ADVANCED SEARCH & FILTER
// Use this for: http://localhost:5000/api/jobs/search?location=Remote&skill=React
router.get('/search', async (req, res) => {
    try {
        const { skill, title, location, jobType } = req.query;
        let query = {};

        if (skill) query.requiredSkills = { $in: [new RegExp(skill, 'i')] };
        if (title) query.title = new RegExp(title, 'i');
        if (location) query.location = new RegExp(location, 'i');
        if (jobType) query.jobType = jobType;

        const jobs = await Job.find(query).sort({ createdAt: -1 });
        res.status(200).json(jobs);
    } catch (err) {
        res.status(500).json({ error: 'Search failed' });
    }
});

// 3. SMART MATCHING (Resume Text Parsing)
router.post('/match', async (req, res) => {
    try {
        const { resumeText } = req.body;
        if (!resumeText) return res.status(400).json({ error: "Resume text is required" });

        const allJobs = await Job.find();

        const matches = allJobs.map(job => {
            // Check for skills inside the text using Regex
            const matchedSkills = job.requiredSkills.filter(skill => 
                new RegExp(`\\b${skill}\\b`, 'i').test(resumeText)
            );

            const score = job.requiredSkills.length > 0 
                ? (matchedSkills.length / job.requiredSkills.length) * 100 
                : 0;

            return {
                jobId: job._id,
                jobTitle: job.title,
                location: job.location,
                matchScore: `${Math.round(score)}%`,
                matchedSkills,
                missingSkills: job.requiredSkills.filter(s => !matchedSkills.includes(s))
            };
        });

        // Sort by highest match score
        res.status(200).json(matches.sort((a, b) => parseInt(b.matchScore) - parseInt(a.matchScore)));
    } catch (err) {
        res.status(500).json({ error: 'Matching process failed' });
    }
});

export default router;