import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { createAiLimiter } from "../middleware/rateLimit.js";
import {
  analyzeCode,
  getHint,
  explainError,
  generateTestCases,
  optimizeCode,
  reviewCode,
  generateSimilarProblem,
  chatWithAI,
} from "../controllers/aiController.js";
import {
  analyzeBodySchema,
  chatBodySchema,
  explainErrorBodySchema,
  generateTestsBodySchema,
  hintBodySchema,
  optimizeBodySchema,
  reviewBodySchema,
  similarProblemBodySchema,
} from "../schemas/aiSchemas.js";

const router = express.Router();

router.use(createAiLimiter());

router.post("/analyze", protectRoute, validate({ body: analyzeBodySchema }), asyncHandler(analyzeCode));
router.post("/hint", protectRoute, validate({ body: hintBodySchema }), asyncHandler(getHint));
router.post("/explain-error", protectRoute, validate({ body: explainErrorBodySchema }), asyncHandler(explainError));
router.post("/generate-tests", protectRoute, validate({ body: generateTestsBodySchema }), asyncHandler(generateTestCases));
router.post("/optimize", protectRoute, validate({ body: optimizeBodySchema }), asyncHandler(optimizeCode));
router.post("/review", protectRoute, validate({ body: reviewBodySchema }), asyncHandler(reviewCode));
router.post("/similar-problem", protectRoute, validate({ body: similarProblemBodySchema }), asyncHandler(generateSimilarProblem));
router.post("/chat", protectRoute, validate({ body: chatBodySchema }), asyncHandler(chatWithAI));

export default router;
