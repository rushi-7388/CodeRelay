import CodeRun from "../models/CodeRun.js";
import { runCodeInternal } from "../lib/runner.js";

export async function saveRun(req, res) {
    try {
        const userId = req.user._id;
        const { sessionId, problemTitle, language, code, output, status, executionTime } = req.body;

        if (!problemTitle || !language || !code) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const run = await CodeRun.create({
            userId,
            sessionId,
            problemTitle,
            language,
            code,
            output,
            status,
            executionTime,
        });

        res.status(201).json({ success: true, run });
    } catch (error) {
        console.log("Error in saveRun:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getRuns(req, res) {
    try {
        const userId = req.user._id;
        const { problemTitle } = req.query;

        const query = { userId };
        if (problemTitle) {
            query.problemTitle = problemTitle;
        }

        const runs = await CodeRun.find(query)
            .sort({ createdAt: -1 })
            .limit(20);

        res.status(200).json({ success: true, runs });
    } catch (error) {
        console.log("Error in getRuns:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function runCode(req, res) {
    try {
        const { code, language } = req.body;
        if (!code || !language) {
            return res.status(400).json({ message: "Code and language are required" });
        }

        const result = await runCodeInternal(code, language);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error in runCode controller:", error);
        res.status(500).json({ message: "Execution failed" });
    }
}
