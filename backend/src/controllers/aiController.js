import aiCodeAnalysis from "../lib/aiCodeAnalysis.js";
import Problem from "../models/Problem.js";
import { ApiError } from "../middleware/errorHandler.js";

export async function analyzeCode(req, res) {
  const { code, language, problemId } = req.body;

  const problem = problemId ? await Problem.findById(problemId) : null;

  const result = await aiCodeAnalysis.analyzeCode(code, language, problem || {
    title: "Custom Problem",
    difficulty: "Unknown",
    category: "General",
  });

  res.status(200).json(result);
}

export async function getHint(req, res) {
  const { code, language, problemId, failedTestCase } = req.body;

  const problem = await Problem.findById(problemId);
  if (!problem) throw new ApiError(404, "Problem not found");

  const result = await aiCodeAnalysis.getHint(code, language, problem, failedTestCase || {});

  res.status(200).json(result);
}

export async function explainError(req, res) {
  const { error, language } = req.body;
  const errorObj = typeof error === "string" ? { message: error } : error;

  const result = await aiCodeAnalysis.explainError(errorObj, language);

  res.status(200).json(result);
}

export async function generateTestCases(req, res) {
  const { problemDescription, language, count } = req.body;

  const result = await aiCodeAnalysis.generateTestCases(problemDescription, language, count || 3);

  if (!result.success) return res.status(200).json(result);

  try {
    const testCases = JSON.parse(result.content);
    res.status(200).json({
      success: true,
      testCases: Array.isArray(testCases) ? testCases : [],
    });
  } catch {
    res.status(200).json({
      success: true,
      testCases: [],
      rawContent: result.content,
    });
  }
}

export async function optimizeCode(req, res) {
  const { code, language, problemId } = req.body;

  const problem = problemId ? await Problem.findById(problemId) : null;

  const result = await aiCodeAnalysis.optimizeCode(code, language, problem || {});

  res.status(200).json(result);
}

export async function reviewCode(req, res) {
  const { code, language, problemId } = req.body;

  const problem = await Problem.findById(problemId);
  if (!problem) throw new ApiError(404, "Problem not found");

  const result = await aiCodeAnalysis.reviewCode(code, language, problem);

  res.status(200).json(result);
}

export async function generateSimilarProblem(req, res) {
  let { problemId, difficulty, category } = req.body;

  let solvedProblem = null;
  if (problemId) {
    solvedProblem = await Problem.findById(problemId);
    if (solvedProblem) {
      difficulty = difficulty || solvedProblem.difficulty;
      category = category || solvedProblem.category;
    }
  }

  if (!difficulty || !category) {
    throw new ApiError(400, "Problem ID or difficulty and category are required");
  }

  const result = await aiCodeAnalysis.generateSimilarProblem(
    difficulty,
    category,
    solvedProblem || {}
  );

  res.status(200).json(result);
}

export async function chatWithAI(req, res) {
  const { message, context } = req.body;

  const prompt = `You are a helpful coding assistant for an educational platform. 

Context:
- User is learning programming
- The platform has coding problems and assignments
- User can ask questions about code, algorithms, data structures

User question: ${message}

${context ? `Additional context: ${JSON.stringify(context)}` : ''}

Provide a helpful, educational response.`;

  const result = await aiCodeAnalysis.callAI(prompt);

  res.status(200).json(result);
}
