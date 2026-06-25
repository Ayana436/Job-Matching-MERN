import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    // 1. Change location to a simple String to allow cities
    location: { type: String, required: true }, 
    requiredSkills: [String], 
    workMode: { 
        type: String, 
        enum: ['Remote', 'Hybrid', 'Office'], 
        default: 'Office' 
    },
    jobType: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship'], default: 'Full-time' },
    experienceLevel: { type: String, enum: ['Entry Level', 'Mid Level', 'Senior Level'], default: 'Entry Level' },
    salary: {
        type: String,
        trim: true,
        default: 'Negotiable'
    },
    description: { type: String, required: true },
    // 2. Add workMode to handle the categories
    processedKeywords: [String],
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Job', jobSchema);
