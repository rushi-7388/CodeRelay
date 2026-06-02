import { config } from "./config";
import { applySelectedApiUrl, selectFastestApiNode } from "./relayBalancer";
import { updateAxiosBaseUrl } from "./axios";

async function loadPublicConfig(baseApiUrl) {
  const url = `${baseApiUrl.replace(/\/$/, "")}/config/public`;
  try {
    const res = await fetch(url, { credentials: "omit" });
    if (!res.ok) return;
    const data = await res.json();
    if (data.apiUrl) config.apiUrl = data.apiUrl;
    if (data.clerkPublishableKey) config.clerkPublishableKey = data.clerkPublishableKey;
  } catch {
    // keep defaults
  }
}

/**
 * Boot sequence: Relay Balance → public config → axios base URL.
 */
export async function bootstrapPublicConfig() {
  const balance = await selectFastestApiNode();
  applySelectedApiUrl(balance.apiUrl);
  updateAxiosBaseUrl(config.apiUrl);
  await loadPublicConfig(config.apiUrl);
  updateAxiosBaseUrl(config.apiUrl);
  return { config, balance };
}
