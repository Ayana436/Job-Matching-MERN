import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    requiredSkills: [String], 
    location: { type: String, default: "Remote" },
    jobType: { type: String, enum: ['Full-time', 'Part-time', 'Contract'], default: 'Full-time' },
    salaryRange: { type: String },
    experienceLevel: { type: String, enum: ['Entry', 'Mid', 'Senior'], default: 'Entry' },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Job', jobSchema);