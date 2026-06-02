import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { saveRun, getRuns, runCode } from "../controllers/codeRunController.js";

const router = express.Router();

router.post("/", protectRoute, saveRun);
router.get("/", protectRoute, getRuns);
router.post("/run", protectRoute, runCode);

export default router;
