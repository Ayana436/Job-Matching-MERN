import express from "express";
import {
    getApplicantsPerJob,
    getAcceptanceRatio,
    getTopSkills,
    getApplicationTrends,
} from "../controllers/analyticsController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorize("recruiter", "admin"));

router.get("/applicants-per-job", getApplicantsPerJob);
router.get("/acceptance-ratio", getAcceptanceRatio);
router.get("/top-skills", getTopSkills);
router.get("/application-trends", getApplicationTrends);

export default router;
