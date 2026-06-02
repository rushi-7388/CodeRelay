/** @type {{ apiUrl?: string, clerkPublishableKey?: string }} */
let windowCfg;

function getWindowConfig() {
  if (typeof window === "undefined") return undefined;
  return window.__CODE_RELAY_CONFIG__ || window.__APP_CONFIG__;
}

windowCfg = getWindowConfig();

/**
 * Only these VITE_* keys may appear in the frontend bundle.
 * All secrets must stay on the backend.
 */
export const ALLOWED_PUBLIC_ENV_KEYS = ["VITE_API_URL", "VITE_CLERK_PUBLISHABLE_KEY"];

export const config = {
  apiUrl:
    windowCfg?.apiUrl ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",
  clerkPublishableKey:
    windowCfg?.clerkPublishableKey ||
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
    "",
};
