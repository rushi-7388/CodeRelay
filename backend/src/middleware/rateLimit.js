import rateLimit from "express-rate-limit";

export function createApiLimiter(options = {}) {
  return rateLimit({
    windowMs: 60_000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
  });
}

export function createAiLimiter(options = {}) {
  return rateLimit({
    windowMs: 60_000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: {
        code: "RATE_LIMITED",
        message: "Too many AI requests. Please wait and try again.",
      },
    },
    ...options,
  });
}

