import express from "express";
import {
  createClassroom,
  getClassrooms,
  getClassroom,
  updateClassroom,
  joinClassroom,
  leaveClassroom,
  removeStudent,
  regenerateInviteCode,
} from "../controllers/classroomController.js";

const router = express.Router();

router.post("/", createClassroom);
router.get("/", getClassrooms);
router.get("/:classroomId", getClassroom);
router.put("/:classroomId", updateClassroom);
router.post("/join", joinClassroom);
router.post("/:classroomId/leave", leaveClassroom);
router.delete("/:classroomId/students/:studentId", removeStudent);
router.post("/:classroomId/regenerate-code", regenerateInviteCode);

export default router;
