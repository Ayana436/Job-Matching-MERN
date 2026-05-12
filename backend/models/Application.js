import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Pending', 'Reviewed', 'Accepted', 'Rejected'], default: 'Pending' },
    matchScore: { type: Number, default: 0 },
    candidateSkills: { type: [String], default: [] },
    appliedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Application', applicationSchema);