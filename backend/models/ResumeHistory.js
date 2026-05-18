import mongoose from "mongoose";

const resumeHistorySchema = new mongoose.Schema(
{
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    fileName: String,

    filePath: String,

    uploadedAt: Date,

    extractedSkills: [String],

    topMatchScore: Number,

    totalMatches: Number
},
{
    timestamps: true
}
);

export default mongoose.model(
    "ResumeHistory",
    resumeHistorySchema
);