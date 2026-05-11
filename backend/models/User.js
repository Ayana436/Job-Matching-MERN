import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['candidate', 'recruiter'], 
        default: 'candidate' 
    },
    resumePath: { type: String }, // Stores the path from Multer for Quick Apply
    appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;