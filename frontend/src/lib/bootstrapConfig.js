import { config } from "./config";

/**
 * Loads public runtime config from the backend so production builds
 * do not need secret-bearing VITE_* variables baked into the bundle.
 */
export async function bootstrapPublicConfig() {
  const base = config.apiUrl || "http://localhost:5000/api";
  const url = `${base.replace(/\/$/, "")}/config/public`;

  try {
    const res = await fetch(url, { credentials: "omit" });
    if (!res.ok) return config;
    const data = await res.json();
    if (data.apiUrl) config.apiUrl = data.apiUrl;
    if (data.clerkPublishableKey) config.clerkPublishableKey = data.clerkPublishableKey;
    return config;
  } catch {
    return config;
  }
}
