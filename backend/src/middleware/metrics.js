let requestCount = 0;
let activeRequests = 0;
const startedAt = Date.now();

export function metricsMiddleware(req, res, next) {
  requestCount += 1;
  activeRequests += 1;
  res.on("finish", () => {
    activeRequests = Math.max(0, activeRequests - 1);
  });
  next();
}

export function getMetricsSnapshot() {
  const mem = process.memoryUsage();
  return {
    uptimeSec: Math.round(process.uptime()),
    startedAt: new Date(startedAt).toISOString(),
    requestCount,
    activeRequests,
    memoryMb: {
      rss: Math.round(mem.rss / 1024 / 1024),
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
    },
    region: process.env.REGION || "default",
    instanceId: process.env.RENDER_INSTANCE_ID || process.env.FLY_MACHINE_ID || process.env.HOSTNAME || "local",
  };
}
