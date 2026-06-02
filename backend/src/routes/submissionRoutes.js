import express from "express";
import {
  submitCode,
  getSubmissions,
  getSubmission,
  gradeSubmission,
  getStudentProgress,
} from "../controllers/submissionController.js";

const router = express.Router();

router.post("/submit", submitCode);
router.get("/", getSubmissions);
router.get("/:submissionId", getSubmission);
router.put("/:submissionId/grade", gradeSubmission);
router.get("/classroom/:classroomId/progress", getStudentProgress);

export default router;
