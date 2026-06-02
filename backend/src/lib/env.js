import dotenv from "dotenv";

dotenv.config({ quiet: true });

function derivePublicApiUrl() {
  if (process.env.PUBLIC_API_URL) return process.env.PUBLIC_API_URL;
  if (process.env.API_PUBLIC_URL) return process.env.API_PUBLIC_URL;
  const port = process.env.PORT || "5000";
  if (process.env.NODE_ENV === "production" && process.env.CLIENT_URL) {
    try {
      const client = new URL(process.env.CLIENT_URL);
      return `${client.origin}/api`;
    } catch {
      // fall through
    }
  }
  return `http://localhost:${port}/api`;
}

export const ENV = {
  PORT: process.env.PORT,
  DB_URL: process.env.DB_URL,
  NODE_ENV: process.env.NODE_ENV,
  CLIENT_URL: process.env.CLIENT_URL,
  PUBLIC_API_URL: derivePublicApiUrl(),
  CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
  INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
  INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,
  STREAM_API_KEY: process.env.STREAM_API_KEY,
  STREAM_API_SECRET: process.env.STREAM_API_SECRET,
  CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  AI_API_KEY: process.env.AI_API_KEY,
  AI_PROVIDER: process.env.AI_PROVIDER,
  AI_MODEL: process.env.AI_MODEL,
  AI_TIMEOUT_MS: process.env.AI_TIMEOUT_MS,
  AI_MAX_PROMPT_CHARS: process.env.AI_MAX_PROMPT_CHARS,
  AI_CUSTOM_ENDPOINT: process.env.AI_CUSTOM_ENDPOINT,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
};
