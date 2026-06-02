import { z } from "zod";

const codeString = z.string().min(1).max(200_000);
const languageString = z.string().min(1).max(64);
const objectIdString = z.string().min(1).max(64);

export const analyzeBodySchema = z.object({
  code: codeString,
  language: languageString,
  problemId: objectIdString.optional(),
});

export const hintBodySchema = z.object({
  code: codeString,
  language: languageString,
  problemId: objectIdString,
  failedTestCase: z
    .object({
      input: z.any().optional(),
      expectedOutput: z.any().optional(),
      actualOutput: z.any().optional(),
      error: z.any().optional(),
    })
    .passthrough()
    .optional(),
});

export const explainErrorBodySchema = z.object({
  error: z.union([z.string().min(1).max(50_000), z.object({ message: z.string().min(1).max(50_000) }).passthrough()]),
  language: languageString,
});

export const generateTestsBodySchema = z.object({
  problemDescription: z.string().min(1).max(50_000),
  language: languageString,
  count: z.number().int().min(1).max(10).optional(),
});

export const optimizeBodySchema = z.object({
  code: codeString,
  language: languageString,
  problemId: objectIdString.optional(),
});

export const reviewBodySchema = z.object({
  code: codeString,
  language: languageString,
  problemId: objectIdString,
});

export const similarProblemBodySchema = z.object({
  problemId: objectIdString.optional(),
  difficulty: z.string().min(1).max(64).optional(),
  category: z.string().min(1).max(64).optional(),
});

export const chatBodySchema = z.object({
  message: z.string().min(1).max(20_000),
  context: z.unknown().optional(),
});

