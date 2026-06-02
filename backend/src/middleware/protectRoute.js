import { requireAuth } from "@clerk/express";
import User from "../models/User.js";
import { ApiError } from "./errorHandler.js";

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const clerkId = req.auth().userId;

      if (!clerkId) return next(new ApiError(401, "Unauthorized - invalid token"));

      // find user in db by clerk ID
      const user = await User.findOne({ clerkId });

      if (!user) return next(new ApiError(404, "User not found"));

      // attach user to req
      req.user = user;

      next();
    } catch (error) {
      next(error);
    }
  },
];
