import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  connectGitHub,
  disconnectGitHub,
  getGitHubStatus,
  getRepositories,
  getCommits,
  createRepository,
  pushCode,
  getUserActivity,
} from "../controllers/githubController.js";

const router = express.Router();

router.post("/connect", protectRoute, connectGitHub);
router.post("/disconnect", protectRoute, disconnectGitHub);
router.get("/status", protectRoute, getGitHubStatus);
router.get("/repos", protectRoute, getRepositories);
router.get("/commits", protectRoute, getCommits);
router.post("/repos", protectRoute, createRepository);
router.post("/push", protectRoute, pushCode);
router.get("/activity", protectRoute, getUserActivity);

export default router;
