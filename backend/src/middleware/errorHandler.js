export class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function notFoundHandler(req, res, next) {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
    },
  });
}

export function errorHandler(err, req, res, next) {
  const statusCode = err?.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500;

  if (statusCode >= 500) {
    // avoid leaking internals in responses; log full error server-side
    req.log?.error?.({ err }, "Unhandled error");
  }

  const payload = {
    error: {
      code: err?.code || (statusCode === 500 ? "INTERNAL_ERROR" : "BAD_REQUEST"),
      message: statusCode === 500 ? "Internal Server Error" : (err?.message || "Request failed"),
    },
  };

  if (err?.details) payload.error.details = err.details;
  if (process.env.NODE_ENV !== "production" && err?.stack) payload.error.stack = err.stack;

  res.status(statusCode).json(payload);
}

