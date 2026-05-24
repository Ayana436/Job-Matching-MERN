

import fs from "fs";
import path from "path";
import User from "../models/User.js";

export const deleteResume = async (req, res) => {
    try {

        // FIND USER
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        // CHECK RESUME EXISTS
        if (!user.resume || !user.resume.filePath) {
            return res.status(404).json({
                error: "No resume found"
            });
        }

        // FILE PATH
        const resumePath = path.join(
            process.cwd(),
            user.resume.filePath.replace(/^\/+/, "")
        );

        // DELETE FILE FROM UPLOADS FOLDER
        if (fs.existsSync(resumePath)) {
            fs.unlinkSync(resumePath);
        }

        // REMOVE RESUME FROM DB
        user.resume = null;

        await user.save();

        return res.status(200).json({
            message: "Resume deleted successfully"
        });

    } catch (err) {

        console.error("Delete Resume Error:", err);

        return res.status(500).json({
            error: "Failed to delete resume"
        });
    }
};