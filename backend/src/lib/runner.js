import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import os from "os";

const execAsync = promisify(exec);

const LANGUAGE_CONFIG = {
  javascript: { extension: "js", compileCmd: null, runCmd: (file) => `node ${file}`, timeout: 5000 },
  python: { extension: "py", compileCmd: null, runCmd: (file) => `python3 ${file}`, timeout: 5000 },
  java: { extension: "java", compileCmd: (file) => `javac ${file}`, runCmd: (file, className) => `java -cp . ${className}`, timeout: 10000 },
  cpp: { extension: "cpp", compileCmd: (file) => `g++ -O2 ${file} -o a.out`, runCmd: () => `./a.out`, timeout: 5000 },
  c: { extension: "c", compileCmd: (file) => `gcc -O2 ${file} -o a.out`, runCmd: () => `./a.out`, timeout: 5000 },
  rust: { extension: "rs", compileCmd: (file) => `rustc ${file} -o a.out`, runCmd: () => `./a.out`, timeout: 5000 },
  go: { extension: "go", compileCmd: (file) => `go build -o a.out ${file}`, runCmd: () => `./a.out`, timeout: 5000 },
  csharp: { extension: "cs", compileCmd: (file) => `mcs ${file}`, runCmd: (file) => `mono ${file.replace('.cs', '.exe')}`, timeout: 5000 },
  ruby: { extension: "rb", compileCmd: null, runCmd: (file) => `ruby ${file}`, timeout: 5000 },
  php: { extension: "php", compileCmd: null, runCmd: (file) => `php ${file}`, timeout: 5000 },
  swift: { extension: "swift", compileCmd: (file) => `swiftc ${file} -o a.out`, runCmd: () => `./a.out`, timeout: 5000 },
  kotlin: { extension: "kt", compileCmd: (file) => `kotlinc ${file} -include-runtime -d a.jar`, runCmd: () => `java -jar a.jar`, timeout: 10000 },
  sql: { extension: "sql", compileCmd: null, runCmd: (file) => `sqlite3 < ${file}`, timeout: 5000 },
  typescript: { extension: "ts", compileCmd: null, runCmd: (file) => `ts-node ${file}`, timeout: 5000 },
};

export async function runCodeInternal(code, language) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "code-exec-"));

  try {
    const config = LANGUAGE_CONFIG[language];
    if (!config) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const className = "Main";
    let fullCode = code;
    if (language === "java") {
      fullCode = code.includes("public class Main") ? code : `public class Main {\n${code}\n}`;
    }

    const fileName = language === "java" ? "Main.java" : `Main.${config.extension}`;
    const filePath = path.join(tempDir, fileName);

    fs.writeFileSync(filePath, fullCode);

    if (config.compileCmd) {
      await execAsync(config.compileCmd(filePath), { cwd: tempDir, timeout: 10000 });
    }

    const startTime = Date.now();
    const { stdout, stderr } = await execAsync(
      config.runCmd(filePath, className),
      { cwd: tempDir, timeout: config.timeout }
    );
    const executionTime = Date.now() - startTime;

    return {
      success: true,
      output: stdout,
      error: stderr,
      executionTime,
    };
  } catch (error) {
    return {
      success: false,
      output: error.stdout || "",
      error: error.stderr || error.message || "Runtime error",
      executionTime: 0,
    };
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {
      console.error("Failed to clean up temp dir:", e);
    }
  }
}
