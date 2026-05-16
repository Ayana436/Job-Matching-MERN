const ResumeSchema = new mongoose.Schema({
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    fileName: String,

    extractedText: String,

    extractedSkills: [String],

    uploadedAt: {
        type: Date,
        default: Date.now
    }
});