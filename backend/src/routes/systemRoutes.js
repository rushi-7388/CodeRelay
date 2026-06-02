import express from "express";
import { getDbReadiness } from "../lib/db.js";
import { getMetricsSnapshot } from "../middleware/metrics.js";
import { ENV } from "../lib/env.js";

const router = express.Router();

router.get("/status", (_req, res) => {
  const db = getDbReadiness();
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    ok: db.ok,
    service: "coderelay-api",
    checks: { db },
    metrics: getMetricsSnapshot(),
    loadScore: getMetricsSnapshot().activeRequests,
  });
});

router.get("/relay-balance", (_req, res) => {
  const metrics = getMetricsSnapshot();
  const loadScore = metrics.activeRequests + Math.round(metrics.memoryMb.heapUsed / 128);
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    ok: true,
    node: {
      region: metrics.region,
      instanceId: metrics.instanceId,
      latencyHintMs: loadScore,
      apiUrl: ENV.PUBLIC_API_URL,
    },
    metrics,
  });
});

export default router;
