import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  createDeployment,
  getDeploymentBySlug,
  getDeploymentBySessionId,
  testCodeExecution
} from "../controllers/deploymentController.js";

const router = express.Router();

router.post("/", protectRoute, createDeployment);
router.get("/:slug", getDeploymentBySlug); // Public route for previews
router.get("/session/:sessionId", protectRoute, getDeploymentBySessionId);

// To actually run the code on the preview page
router.post("/:slug/execute", testCodeExecution);

export default router;
