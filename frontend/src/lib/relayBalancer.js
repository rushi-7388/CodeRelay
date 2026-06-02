import { config } from "./config";

const STORAGE_KEY = "coderelay_active_api";
const PROBE_TIMEOUT_MS = 3500;

function normalizeApiUrl(url) {
  return String(url || "")
    .trim()
    .replace(/\/$/, "");
}

function originFromApiUrl(apiUrl) {
  const normalized = normalizeApiUrl(apiUrl);
  if (normalized.endsWith("/api")) return normalized.slice(0, -4);
  return normalized;
}

export function getApiCandidates() {
  const fromList = (import.meta.env.VITE_API_URLS || "")
    .split(",")
    .map((s) => normalizeApiUrl(s))
    .filter(Boolean);

  const primary = normalizeApiUrl(config.apiUrl);
  const merged = [...new Set([primary, ...fromList].filter(Boolean))];
  return merged.length ? merged : ["http://localhost:5000/api"];
}

async function probeNode(apiUrl) {
  const start = performance.now();
  const origin = originFromApiUrl(apiUrl);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);

  try {
    const res = await fetch(`${origin}/health/live`, {
      signal: controller.signal,
      credentials: "omit",
    });
    if (!res.ok) throw new Error("unhealthy");
    return { apiUrl: normalizeApiUrl(apiUrl), latencyMs: Math.round(performance.now() - start), healthy: true };
  } catch {
    return { apiUrl: normalizeApiUrl(apiUrl), latencyMs: Infinity, healthy: false };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Relay Balance™ — picks the lowest-latency healthy API node from the pool.
 */
export async function selectFastestApiNode() {
  const candidates = getApiCandidates();
  const results = await Promise.all(candidates.map(probeNode));
  const healthy = results.filter((r) => r.healthy).sort((a, b) => a.latencyMs - b.latencyMs);

  if (healthy.length === 0) {
    return { apiUrl: candidates[0], nodes: results, selected: false };
  }

  const winner = healthy[0];
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(STORAGE_KEY, winner.apiUrl);
  }
  return { apiUrl: winner.apiUrl, nodes: results, selected: true, latencyMs: winner.latencyMs };
}

export function applySelectedApiUrl(apiUrl) {
  if (apiUrl) config.apiUrl = normalizeApiUrl(apiUrl);
}
