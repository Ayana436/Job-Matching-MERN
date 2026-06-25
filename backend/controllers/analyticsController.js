import Application from "../models/Application.js";
import Job from "../models/Job.js";

const getVisibleJobs = (req) => {
    if (req.user.role === "admin") {
        return Job.find({});
    }
    // For recruiters: include jobs they posted + legacy jobs without postedBy
    return Job.find({
        $or: [
            { postedBy: req.user.id },
            {postedBy: null},
            { postedBy: { $exists: false } }
        ]
    });
};

// APPLICANTS PER JOB
export const getApplicantsPerJob = async (req, res) => {
    try {
        const jobs = await getVisibleJobs(req);
        const result = await Promise.all(
            jobs.map(async (job) => {
                const applicants = await Application.countDocuments({
                    jobId: job._id
                });
                return { jobTitle: job.title, applicants };
            })
        );

        res.json(result);
    } catch (err) {
        res.status(500).json({
            error: "Analytics fetch failed"
        });
    }
};


// ACCEPTANCE RATIO
export const getAcceptanceRatio = async (req, res) => {
    try {
        const jobs = await getVisibleJobs(req);
        const jobIds = jobs.map(job => job._id);
        const total = await Application.countDocuments({
            jobId: { $in: jobIds }
        });
        const accepted = await Application.countDocuments({
            jobId: { $in: jobIds },
            status: "accepted"
        });
        const rejected = await Application.countDocuments({
            jobId: { $in: jobIds },
            status: "rejected"
        });
        const pending = await Application.countDocuments({
            jobId: { $in: jobIds },
            status: "pending"
        });
        const reviewed = await Application.countDocuments({
            jobId: { $in: jobIds },
            status: "reviewed"
        });
        res.json({
            total,
            accepted,
            rejected,
            pending,
            reviewed
        });
    } catch (err) {
        res.status(500).json({
            error: "Ratio fetch failed"
        });
    }
};


// TOP SKILLS DEMAND
export const getTopSkills = async (req, res) => {
    try {
        const jobs = await getVisibleJobs(req);
        const skillMap = {};
        jobs.forEach(job => {
            const skills = job.requiredSkills || [];
            skills.forEach(skill => {
                skillMap[skill] =
                    (skillMap[skill] || 0) + 1;
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
    } catch (err) {
        res.status(500).json({
            error: "Skills analytics failed"
        });
    }
};


// APPLICATION TRENDS
// export const getApplicationTrends = async (req, res) => {
//     try {
//         // console.log("USER:", req.user);

// const jobs = await getVisibleJobs(req);


// const jobIds = jobs.map(job => job._id);

// const applications = await Application.find({
//     jobId: { $in: jobIds }
// });

// const trends = {};
// applications.forEach(app => {
//     const date = new Date(app.createdAt)
//     .toLocaleDateString();
//     trends[date] =
//     (trends[date] || 0) + 1;
// });
// const result = Object.entries(trends).map(
//     ([date, count]) => ({
//         date,
//         applications: count
//     })
// );

//         console.log("VISIBLE JOBS:", jobs.length);
//         console.log("JOB IDS:", jobIds);
//         console.log("APPLICATIONS:", applications.length);
//         console.log("result:", result);
        

//         res.json(result);
//     } catch (err) {
// console.log(err);
//         res.status(500).json({
//             error: "Trend analytics failed"
//         });
//     }
// };

export const getApplicationTrends = async (req, res) => {
    // Inside your application trends backend controller:
const recruiterJobs = await Job.find({ createdBy: req.user.id }).select('_id');
const jobIds = recruiterJobs.map(job => job._id);

const trends = await Application.aggregate([
    { $match: { jobId: { $in: jobIds } } }, // 👈 Match apps to the recruiter's jobs!
    {
        $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
        }
    },
    { $sort: { "_id": 1 } }
]);
    res.json(trends);
}
