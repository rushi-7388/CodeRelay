import express from "express";
import { ENV } from "../lib/env.js";

const router = express.Router();

/**
 * Public runtime config for the frontend.
 * Never expose secret keys — only values safe to ship to browsers.
 */
router.get("/public", (_req, res) => {
  res.setHeader("Cache-Control", "public, max-age=60");
  res.status(200).json({
    apiUrl: ENV.PUBLIC_API_URL,
    clerkPublishableKey: ENV.CLERK_PUBLISHABLE_KEY || "",
    appName: "CodeRelay",
  });
});

export default router;
