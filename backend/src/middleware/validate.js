import { ZodError } from "zod";
import { ApiError } from "./errorHandler.js";

export function validate({ body, query, params }) {
  return (req, _res, next) => {
    try {
      if (body) req.body = body.parse(req.body);
      if (query) req.query = query.parse(req.query);
      if (params) req.params = params.parse(req.params);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(
          new ApiError(400, "Invalid request", {
            issues: err.issues.map((i) => ({
              path: i.path.join("."),
              message: i.message,
            })),
          })
        );
      }
      next(err);
    }
  };
}

