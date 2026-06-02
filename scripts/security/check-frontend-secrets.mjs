import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

const ALLOWED_VITE_KEYS = new Set(["VITE_API_URL", "VITE_API_URLS", "VITE_CLERK_PUBLISHABLE_KEY"]);

const FORBIDDEN_PATTERNS = [
  /sk-[A-Za-z0-9]{20,}/,
  /sk-ant-[A-Za-z0-9_-]{20,}/,
  /\bOPENAI_API_KEY\b/,
  /\bANTHROPIC_API_KEY\b/,
  /\bSTRIPE_SECRET_KEY\b/,
  /\bSTRIPE_WEBHOOK_SECRET\b/,
  /\bCLERK_SECRET_KEY\b/,
  /\bAI_API_KEY\b/,
  /\bDB_URL\b/,
  /\bwhsec_[A-Za-z0-9]+/,
  /\bghp_[A-Za-z0-9]{20,}/,
  /\bgithub_pat_[A-Za-z0-9_]+/,
];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(js|jsx|ts|tsx|html|css|json|map)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function checkViteEnvExample() {
  const examplePath = path.join(repoRoot, "frontend", ".env.example");
  if (!fs.existsSync(examplePath)) return [];
  const text = fs.readFileSync(examplePath, "utf8");
  const issues = [];
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)=/);
    if (!m) continue;
    const key = m[1];
    if (key.startsWith("VITE_") && !ALLOWED_VITE_KEYS.has(key)) {
      issues.push(`frontend/.env.example defines disallowed VITE key: ${key}`);
    }
  }
  return issues;
}

function scanPaths(paths) {
  const issues = [];
  for (const file of paths) {
    const rel = path.relative(repoRoot, file).replace(/\\/g, "/");
    const text = fs.readFileSync(file, "utf8");

    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.test(text)) {
        issues.push(`${rel}: matched forbidden secret pattern ${pattern}`);
      }
    }

    if (rel.startsWith("frontend/") && rel.includes("/src/")) {
      for (const match of text.matchAll(/import\.meta\.env\.([A-Z0-9_]+)/g)) {
        const key = match[1];
        const builtins = new Set(["MODE", "DEV", "PROD", "SSR", "BASE_URL"]);
        if (builtins.has(key)) continue;
        const viteKey = key.startsWith("VITE_") ? key : `VITE_${key}`;
        if (!ALLOWED_VITE_KEYS.has(viteKey)) {
          issues.push(`${rel}: uses non-allowlisted env var import.meta.env.${key}`);
        }
      }
    }
  }
  return issues;
}

const targets = [
  ...walk(path.join(repoRoot, "frontend", "src")),
  ...walk(path.join(repoRoot, "frontend", "dist")),
];

const issues = [...checkViteEnvExample(), ...scanPaths(targets)];

if (issues.length) {
  console.error("Frontend secret guard failed:\n");
  for (const i of issues) console.error(`- ${i}`);
  process.exit(1);
}

console.log("Frontend secret guard passed.");
