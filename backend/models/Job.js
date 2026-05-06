import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Please add a job title'],
        trim: true 
    },
    description: { 
        type: String, 
        required: [true, 'Please add a description'] 
    },
    requiredSkills: {
        type: [String],
        default: []
    },
    postedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const Job = mongoose.model('Job', JobSchema);
export default Job;