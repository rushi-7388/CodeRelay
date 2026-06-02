import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { getLeaderboard, getUserStats, updateProfile } from "../controllers/userController.js";
import { syncUser, getDashboard, getAnalytics } from "../controllers/analyticsController.js";

const router = express.Router();

router.post("/sync", protectRoute, syncUser);
router.get("/dashboard", protectRoute, getDashboard);
router.get("/stats", protectRoute, getUserStats);
router.put("/profile", protectRoute, updateProfile);
router.get("/leaderboard", protectRoute, getLeaderboard);
router.get("/analytics/:classroomId", protectRoute, getAnalytics);

export default router;
