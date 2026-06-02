import test from "node:test";
import assert from "node:assert/strict";

import {
  analyzeBodySchema,
  chatBodySchema,
  explainErrorBodySchema,
  generateTestsBodySchema,
  hintBodySchema,
  optimizeBodySchema,
  reviewBodySchema,
  similarProblemBodySchema,
} from "../src/schemas/aiSchemas.js";

test("analyze schema accepts minimal payload", () => {
  const v = analyzeBodySchema.parse({ code: "print(1)", language: "python" });
  assert.equal(v.language, "python");
});

test("hint schema requires problemId", () => {
  assert.throws(() => hintBodySchema.parse({ code: "x", language: "js" }));
});

test("explainError schema accepts string error", () => {
  const v = explainErrorBodySchema.parse({ error: "TypeError: boom", language: "js" });
  assert.ok(v.error);
});

test("generateTests schema bounds count", () => {
  const v = generateTestsBodySchema.parse({ problemDescription: "sum", language: "js", count: 3 });
  assert.equal(v.count, 3);
  assert.throws(() => generateTestsBodySchema.parse({ problemDescription: "sum", language: "js", count: 99 }));
});

test("optimize/review/similar/chat schemas parse", () => {
  assert.ok(optimizeBodySchema.parse({ code: "x", language: "js" }));
  assert.ok(reviewBodySchema.parse({ code: "x", language: "js", problemId: "abc" }));
  assert.ok(similarProblemBodySchema.parse({ difficulty: "Easy", category: "Arrays" }));
  assert.ok(chatBodySchema.parse({ message: "hi" }));
});

