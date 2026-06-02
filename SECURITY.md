# Security Policy

## Reporting a vulnerability

Please report security issues privately (do not open a public issue with exploit details).

## Secrets handling

- **Never** commit `.env` files or API keys.
- **Never** put secret keys in `VITE_*` variables — Vite embeds them in the browser bundle.
- Allowed frontend env keys: `VITE_API_URL`, `VITE_CLERK_PUBLISHABLE_KEY` (Clerk publishable keys are public by design).
- All AI, Stripe, database, and webhook secrets belong in **backend** environment only (Render/Fly/Vercel server env).

## Runtime config

Production frontends should load public config from `GET /api/config/public` so builds do not require baking URLs/keys into artifacts.

## CI checks

- `node scripts/security/check-frontend-secrets.mjs` — fails if forbidden patterns or disallowed `VITE_*` keys are detected.
- Gitleaks scan (non-blocking) in CI.
