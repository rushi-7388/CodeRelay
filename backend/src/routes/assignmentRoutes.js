import express from "express";
import {
  createAssignment,
  getAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentSubmissions,
} from "../controllers/assignmentController.js";

const router = express.Router();

router.post("/", createAssignment);
router.get("/", getAssignments);
router.get("/:assignmentId", getAssignment);
router.put("/:assignmentId", updateAssignment);
router.delete("/:assignmentId", deleteAssignment);
router.get("/:assignmentId/submissions", getAssignmentSubmissions);

export default router;
