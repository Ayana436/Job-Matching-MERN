

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";
import ResumeHistory from "../models/ResumeHistory.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "..");

const getUploadPath = (filePath = "") => {
    return path.join(
        backendRoot,
        filePath.replace(/^\/+/, "")
    );
};

const deleteResumeFile = (filePath) => {
    if (!filePath) return;

    const resumePath = getUploadPath(filePath);

    if (fs.existsSync(resumePath)) {
        fs.unlinkSync(resumePath);
    }
};

export const deleteResume = async (req, res) => {
    try {

        // FIND USER
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        const historyId = req.params.historyId;
        let selectedResume = null;

        // Resume Selection Logic
        if (historyId) {
            selectedResume = await ResumeHistory.findOne({
                _id: historyId,
                candidateId: req.user.id
            });

            if (!selectedResume) {
                return res.status(404).json({
                    error: "Resume history not found"
                });
            }
        } else {
            selectedResume = user.resume;
        }

        if (!selectedResume || !selectedResume.filePath) {
            return res.status(404).json({
                error: "No resume found"
            });
        }

        // File Delete Logic
        deleteResumeFile(selectedResume.filePath);

        // Resume History Delete Logic
        if (historyId) {
            await ResumeHistory.deleteOne({
                _id: historyId,
                candidateId: req.user.id
            });
        } else {
            await ResumeHistory.deleteMany({
                candidateId: req.user.id,
                filePath: selectedResume.filePath
            });
        }

        user.resumeHistory = (user.resumeHistory || []).filter(
            (item) => item.filePath !== selectedResume.filePath
        );

        // Latest Resume Pointer Logic
        if (user.resume?.filePath === selectedResume.filePath) {
            const latestResume = await ResumeHistory.findOne({
                candidateId: req.user.id
            }).sort({ uploadedAt: -1, createdAt: -1 });

            user.resume = latestResume
                ? {
                    fileName: latestResume.fileName,
                    filePath: latestResume.filePath,
                    uploadedAt: latestResume.uploadedAt
                }
                : null;
        }

        await user.save();

        return res.status(200).json({
            message: "Resume deleted successfully",
            deletedResumeId: historyId || null,
            latestResume: user.resume
        });

    } catch (err) {

        console.error("Delete Resume Error:", err);

        return res.status(500).json({
            error: "Failed to delete resume"
        });
    }
};
