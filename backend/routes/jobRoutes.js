import express from 'express';
import Job from '../models/Job.js';

const router = express.Router();

// 1. Route to CREATE a new job (Already there)
router.post('/add', async (req, res) => {
    try {
        const newJob = new Job(req.body);
        const savedJob = await newJob.save();
        res.status(201).json(savedJob);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 2. Route to GET ALL jobs (New)
router.get('/all', async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 }); // -1 shows newest first
        res.status(200).json(jobs);
    } catch (err) {
        res.status(500).json({ error: 'Server error while fetching jobs' });
    }
});

// 3. Route to MATCH jobs based on skills
router.post('/match', async (req, res) => {
    try {
        const { userSkills } = req.body; // e.g., ["MongoDB", "React"]
        const allJobs = await Job.find();

        const matches = allJobs.map(job => {
            // Check how many skills match
            const matchedSkills = job.requiredSkills.filter(skill => 
                userSkills.includes(skill)
            );

            // Calculate percentage
            const score = (matchedSkills.length / job.requiredSkills.length) * 100;

            return {
                jobTitle: job.title,
                score: Math.round(score),
                matchedSkills: matchedSkills,
                missingSkills: job.requiredSkills.filter(s => !userSkills.includes(s))
            };
        });

        // Sort by highest score
        res.status(200).json(matches.sort((a, b) => b.score - a.score));
    } catch (err) {
        res.status(500).json({ error: 'Matching process failed' });
    }
});

export default router;