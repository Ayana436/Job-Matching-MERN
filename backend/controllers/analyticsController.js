import Application from "../models/Application.js";
import Job from "../models/Job.js";

// Visible Job Scope Logic
const getVisibleJobs = (req) => {
    if (req.user.role === "admin") {
        return Job.find({});
    }

    return Job.find({
        $or: [
            { postedBy: req.user.id },
            { postedBy: null },
            { postedBy: { $exists: false } }
        ]
    });
};

// Applicants Per Job Logic
export const getApplicantsPerJob = async (req, res) => {
    try {
        const jobs = await getVisibleJobs(req);

        const result = await Promise.all(
            jobs.map(async (job) => ({
                jobTitle: job.title,
                applicants: await Application.countDocuments({
                    jobId: job._id
                })
            }))
        );

        res.json(result);
    } catch {
        res.status(500).json({
            error: "Analytics fetch failed"
        });
    }
};

// Application Status Ratio Logic
export const getAcceptanceRatio = async (req, res) => {
    try {
        const jobs = await getVisibleJobs(req);
        const jobIds = jobs.map(job => job._id);

        const [total, accepted, rejected, pending, reviewed] =
            await Promise.all([
                Application.countDocuments({ jobId: { $in: jobIds } }),
                Application.countDocuments({ jobId: { $in: jobIds }, status: "accepted" }),
                Application.countDocuments({ jobId: { $in: jobIds }, status: "rejected" }),
                Application.countDocuments({ jobId: { $in: jobIds }, status: "pending" }),
                Application.countDocuments({ jobId: { $in: jobIds }, status: "reviewed" })
            ]);

        res.json({
            total,
            accepted,
            rejected,
            pending,
            reviewed
        });
    } catch {
        res.status(500).json({
            error: "Ratio fetch failed"
        });
    }
};

// Top Required Skills Logic
export const getTopSkills = async (req, res) => {
    try {
        const jobs = await getVisibleJobs(req);
        const skillMap = {};

        jobs.forEach(job => {
            (job.requiredSkills || []).forEach(skill => {
                skillMap[skill] = (skillMap[skill] || 0) + 1;
            });
        });

        const result = Object.entries(skillMap)
            .map(([skill, count]) => ({
                skill,
                count,
                name: skill,
                value: count
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        res.json(result);
    } catch {
        res.status(500).json({
            error: "Skills analytics failed"
        });
    }
};

// Application Trends Logic
export const getApplicationTrends = async (req, res) => {
    try {
        const jobs = await getVisibleJobs(req);
        const jobIds = jobs.map(job => job._id);

        const applications = await Application.find({
            jobId: { $in: jobIds }
        }).select("createdAt appliedAt");

        const trendMap = {};
        applications.forEach(application => {
            const sourceDate = application.createdAt || application.appliedAt || new Date();
            const date = sourceDate.toISOString().slice(0, 10);
            trendMap[date] = (trendMap[date] || 0) + 1;
        });

        res.json(
            Object.entries(trendMap)
                .map(([date, applications]) => ({
                    date,
                    applications
                }))
                .sort((a, b) => a.date.localeCompare(b.date))
        );
    } catch {
        res.status(500).json({
            error: "Trend analytics failed"
        });
    }
};
