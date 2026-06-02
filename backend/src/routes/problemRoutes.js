import express from "express";
import { createProblem, deleteProblem, getProblemById, getProblems, updateProblem } from "../controllers/problemController.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/", getProblems);
router.get("/:id", getProblemById);

router.post("/", requireAdmin, createProblem);
router.put("/:id", requireAdmin, updateProblem);
router.delete("/:id", requireAdmin, deleteProblem);

export default router;
