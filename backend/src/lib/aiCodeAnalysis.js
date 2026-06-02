import { ENV } from "../lib/env.js";

const DEFAULT_PROVIDER = (ENV.AI_PROVIDER || "anthropic").toLowerCase();
const DEFAULT_TIMEOUT_MS = Number.parseInt(ENV.AI_TIMEOUT_MS || "", 10) || 25_000;
const DEFAULT_MAX_PROMPT_CHARS = Number.parseInt(ENV.AI_MAX_PROMPT_CHARS || "", 10) || 80_000;

function redactSecrets(input) {
  if (!input) return input;
  const patterns = [
    // OpenAI / Anthropic style keys
    /sk-[A-Za-z0-9]{16,}/g,
    /(?<=\b)claude-[A-Za-z0-9_-]{8,}(?=\b)/g,
    /(?<=\b)anthropic_api_key\s*=\s*["']?[^"'\s]+["']?/gi,
    // Common env/key names
    /(OPENAI_API_KEY|ANTHROPIC_API_KEY|AI_API_KEY|STRIPE_SECRET_KEY|DB_URL)\s*=\s*["']?[^"'\s]+["']?/gi,
  ];
  let out = input;
  for (const p of patterns) out = out.replace(p, "[REDACTED]");
  return out;
}

function clampPrompt(prompt) {
  const max = DEFAULT_MAX_PROMPT_CHARS;
  if (prompt.length <= max) return prompt;
  const head = Math.floor(max * 0.7);
  const tail = max - head - 200;
  return `${prompt.slice(0, head)}\n\n[...TRUNCATED...]\n\n${prompt.slice(-tail)}`;
}

async function fetchWithTimeout(url, init, timeoutMs) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(t);
  }
}

function isRetryableStatus(status) {
  return status === 429 || (status >= 500 && status <= 599);
}

async function requestWithRetry(url, init, { timeoutMs }) {
  const attempts = 2;
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    const res = await fetchWithTimeout(url, init, timeoutMs);
    if (res.ok) return res;
    let body;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }
    const message =
      typeof body === "object" && body
        ? body.error?.message || body.message || JSON.stringify(body)
        : String(body);

    lastErr = new Error(message || `HTTP ${res.status}`);
    lastErr.statusCode = res.status;
    if (i < attempts - 1 && isRetryableStatus(res.status)) {
      await new Promise((r) => setTimeout(r, 250 * (i + 1)));
      continue;
    }
    throw lastErr;
  }
  throw lastErr;
}

class AICodeAnalysisService {
  constructor() {
    this.provider = DEFAULT_PROVIDER;
  }

  async analyzeCode(code, language, problem) {
    const prompt = this.buildAnalysisPrompt(code, language, problem);
    return this.callAI(prompt);
  }

  async getHint(code, language, problem, failedTestCase) {
    const prompt = this.buildHintPrompt(code, language, problem, failedTestCase);
    return this.callAI(prompt);
  }

  async explainError(error, language) {
    const prompt = `You are a coding instructor. Explain this error in ${language} in simple terms:

Error: ${error.message}
Stack: ${error.stack || 'N/A'}

Provide:
1. What the error means
2. Why it might be happening
3. How to fix it
4. Example of correct code`;

    return this.callAI(prompt);
  }

  async generateTestCases(problemDescription, language, count = 3) {
    const prompt = `Generate ${count} test cases for this coding problem in ${language}:

Problem: ${problemDescription}

Return a JSON array of test cases with:
- input: the input value
- expectedOutput: the expected output
- description: what this test case checks

Make sure test cases include edge cases and typical scenarios.`;

    return this.callAI(prompt);
  }

  async optimizeCode(code, language, problem) {
    const prompt = `Analyze and optimize this ${language} code for the problem: ${problem.title || problem}

Current Code:
\`\`\`${language}
${code}
\`\`\`

Provide:
1. Time complexity analysis
2. Space complexity analysis
3. Optimization suggestions
4. Optimized code (if possible)
5. Explanation of improvements`;

    return this.callAI(prompt);
  }

  async generateExplanation(code, language, lineOfCode) {
    const prompt = `Explain what this specific line of ${language} code does:

Line ${lineOfCode.lineNumber}: ${lineOfCode.code}

Context:
\`\`\`${language}
${code}
\`\`\`

Provide a clear, beginner-friendly explanation.`;

    return this.callAI(prompt);
  }

  async reviewCode(code, language, problem) {
    const prompt = `Perform a code review for this ${language} solution:

Problem: ${problem.title}
Difficulty: ${problem.difficulty}

Code:
\`\`\`${language}
${code}
\`\`\`

Provide:
1. Correctness assessment
2. Code quality score (1-10)
3. Issues found
4. Suggestions for improvement
5. Best practices followed/missed
6. Security concerns (if any)`;

    return this.callAI(prompt);
  }

  async generateSimilarProblem(difficulty, category, solvedProblem) {
    const prompt = `Generate a similar ${difficulty} ${category} coding problem based on this problem:

${solvedProblem.title}
${solvedProblem.description?.text || ''}

Provide:
1. Problem title
2. Problem description with examples
3. Constraints
4. Hint
5. Expected approach`;

    return this.callAI(prompt);
  }

  buildAnalysisPrompt(code, language, problem) {
    return `Analyze this ${language} code submission for a ${problem.difficulty} problem:

Problem: ${problem.title}
Category: ${problem.category}

Code:
\`\`\`${language}
${code}
\`\`\`

Provide a comprehensive analysis including:
1. Does the approach solve the problem?
2. Time and space complexity
3. Potential bugs or edge cases
4. Code style and readability
5. Suggestions for improvement`;
  }

  buildHintPrompt(code, language, problem, failedTestCase) {
    return `A student is stuck on this ${language} coding problem:

Problem: ${problem.title}
Difficulty: ${problem.difficulty}

Current attempt:
\`\`\`${language}
${code}
\`\`\`

Failed test case:
Input: ${failedTestCase.input}
Expected: ${failedTestCase.expectedOutput}
Actual: ${failedTestCase.actualOutput}
Error: ${failedTestCase.error || 'Wrong answer'}

Provide a helpful hint that guides the student without giving away the full solution.`;
  }

  async callAI(prompt) {
    const safePrompt = clampPrompt(redactSecrets(String(prompt || "")));

    try {
      if (this.provider === "anthropic" || !this.provider) return await this.callAnthropic(safePrompt);
      if (this.provider === "openai") return await this.callOpenAI(safePrompt);
      if (this.provider === "custom") return await this.callCustomEndpoint(safePrompt);

      return {
        success: false,
        error: `Unsupported AI_PROVIDER: ${this.provider}`,
        fallback: true,
      };
    } catch (error) {
      console.error("AI service error:", error.message);
      return {
        success: false,
        error: error.message,
        fallback: true,
      };
    }
  }

  async callOpenAI(prompt) {
    const apiKey = ENV.OPENAI_API_KEY || ENV.AI_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        error: "AI service not configured. Please set OPENAI_API_KEY (or AI_API_KEY) in environment.",
        fallback: true,
      };
    }

    const model = ENV.AI_MODEL || "gpt-4o-mini";

    const response = await requestWithRetry(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content:
                "You are an expert coding instructor and competitive programming coach. You help students learn programming by providing clear, educational feedback. Always be encouraging and focus on helping students understand concepts, not just fixing code.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      },
      { timeoutMs: DEFAULT_TIMEOUT_MS }
    );

    const data = await response.json();
    return {
      success: true,
      content: data.choices[0].message.content,
      model: data.model,
      usage: data.usage,
    };
  }

  async callAnthropic(prompt) {
    const apiKey = ENV.ANTHROPIC_API_KEY || ENV.AI_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        error: "AI service not configured. Please set ANTHROPIC_API_KEY (or AI_API_KEY) in environment.",
        fallback: true,
      };
    }

    const model = ENV.AI_MODEL || "claude-3-haiku-20240307";

    const response = await requestWithRetry(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 2000,
          system: "You are an expert coding instructor and competitive programming coach.",
          messages: [{ role: "user", content: prompt }],
        }),
      },
      { timeoutMs: DEFAULT_TIMEOUT_MS }
    );

    const data = await response.json();
    return {
      success: true,
      content: data.content[0].text,
      model: data.model,
      usage: data.usage,
    };
  }

  async callCustomEndpoint(prompt) {
    const customEndpoint = ENV.AI_CUSTOM_ENDPOINT;
    const apiKey = ENV.AI_API_KEY || ENV.OPENAI_API_KEY || ENV.ANTHROPIC_API_KEY;
    if (!customEndpoint) throw new Error("AI_CUSTOM_ENDPOINT is not configured");

    const response = await requestWithRetry(
      customEndpoint,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          prompt,
          provider: this.provider,
          model: ENV.AI_MODEL,
        }),
      },
      { timeoutMs: DEFAULT_TIMEOUT_MS }
    );

    try {
      return await response.json();
    } catch {
      const txt = await response.text();
      return { success: true, content: txt };
    }
  }
}

const aiCodeAnalysis = new AICodeAnalysisService();

export default aiCodeAnalysis;
