import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { addComment, getComments } from "../controllers/commentController.js";

const router = express.Router();

router.post("/", protectRoute, addComment);
router.get("/:sessionId", protectRoute, getComments);

export default router;
