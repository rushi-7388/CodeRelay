import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";
import { createServer } from "http";

import { ENV } from "./lib/env.js";
import { connectDB, getDbReadiness } from "./lib/db.js";
import { inngest, functions } from "./lib/inngest.js";
import { initializeSocket } from "./lib/socket.js";
import { createApiLimiter } from "./middleware/rateLimit.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { requestIdMiddleware } from "./middleware/requestId.js";
import { metricsMiddleware } from "./middleware/metrics.js";
import configRoutes from "./routes/configRoutes.js";
import systemRoutes from "./routes/systemRoutes.js";

import sessionRoutes from "./routes/sessionRoute.js";
import userRoutes from "./routes/userRoutes.js";
import codeRunRoutes from "./routes/codeRunRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import problemRoutes from "./routes/problemRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";
import classroomRoutes from "./routes/classroomRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import contestRoutes from "./routes/contestRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import githubRoutes from "./routes/githubRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import deploymentRoutes from "./routes/deploymentRoutes.js";

const app = express();

const __dirname = path.resolve();

// middleware
app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(requestIdMiddleware);
app.use(metricsMiddleware);

app.use(
  pinoHttp({
    enabled: ENV.NODE_ENV !== "test",
    redact: ["req.headers.authorization", "req.headers.cookie"],
  })
);

app.use(
  helmet({
    contentSecurityPolicy: ENV.NODE_ENV === "production",
    crossOriginEmbedderPolicy: false,
    hsts: ENV.NODE_ENV === "production" ? { maxAge: 31536000, includeSubDomains: true } : false,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));

const corsAllowedOrigins = [
  ...(ENV.NODE_ENV !== "production" ? ["http://localhost:5173", "http://127.0.0.1:5173"] : []),
  ENV.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: corsAllowedOrigins,
    credentials: true,
  })
);

app.use(createApiLimiter());

app.use("/api/config", configRoutes);
app.use("/api/system", systemRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use(clerkMiddleware()); // this adds auth field to request object: req.auth()

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/sessions", sessionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/coderuns", codeRunRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/classrooms", classroomRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/contests", contestRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/deployments", deploymentRoutes);

app.get("/health/live", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.get("/health/ready", async (_req, res) => {
  const db = getDbReadiness();
  if (!db.ok) return res.status(503).json({ ok: false, checks: { db } });
  return res.status(200).json({ ok: true, checks: { db } });
});

// make our app ready for deployment
if (ENV.NODE_ENV === "production" && !process.env.VERCEL) {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

app.use("/api", notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();

    if (!process.env.VERCEL) {
      const httpServer = createServer(app);
      initializeSocket(httpServer);
      httpServer.listen(ENV.PORT, () => console.log("Server is running on port:", ENV.PORT));
    }
  } catch (error) {
    console.error("💥 Error starting the server", error);
  }
};

startServer();

export default app;
