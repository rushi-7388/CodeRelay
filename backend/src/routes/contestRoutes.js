import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  createContest,
  getContests,
  getContest,
  updateContest,
  registerContest,
  getContestStandings,
  submitContestProblem,
  generateInviteCode,
  deleteContest,
} from "../controllers/contestController.js";

const router = express.Router();

router.post("/", protectRoute, createContest);
router.get("/", protectRoute, getContests);
router.get("/:contestId", protectRoute, getContest);
router.put("/:contestId", protectRoute, updateContest);
router.delete("/:contestId", protectRoute, deleteContest);
router.post("/:contestId/register", protectRoute, registerContest);
router.get("/:contestId/standings", protectRoute, getContestStandings);
router.post("/:contestId/submit", protectRoute, submitContestProblem);
router.post("/:contestId/invite", protectRoute, generateInviteCode);

export default router;
