import Problem from "../models/Problem.js";

export async function getProblems(req, res) {
    try {
        const problems = await Problem.find({});
        res.status(200).json({ success: true, problems });
    } catch (error) {
        console.log("Error in getProblems:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getProblemById(req, res) {
    try {
        const { id } = req.params;
        const problem = await Problem.findOne({ id: id });

        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        res.status(200).json({ success: true, problem });
    } catch (error) {
        console.log("Error in getProblemById:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function createProblem(req, res) {
    try {
        const { id, title, description, starterCode, ...rest } = req.body;

        if (!id || !title || !description || !starterCode) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const existingProblem = await Problem.findOne({ id });
        if (existingProblem) {
            return res.status(400).json({ message: "Problem with this ID already exists" });
        }

        const problem = await Problem.create({
            id,
            title,
            description,
            starterCode,
            ...rest
        });

        res.status(201).json({ success: true, problem });
    } catch (error) {
        console.log("Error in createProblem:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function updateProblem(req, res) {
    try {
        const { id } = req.params;
        const updates = req.body;

        const problem = await Problem.findOneAndUpdate({ id }, updates, { new: true });

        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        res.status(200).json({ success: true, problem });
    } catch (error) {
        console.log("Error in updateProblem:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function deleteProblem(req, res) {
    try {
        const { id } = req.params;

        const problem = await Problem.findOneAndDelete({ id });

        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        res.status(200).json({ success: true, message: "Problem deleted successfully" });
    } catch (error) {
        console.log("Error in deleteProblem:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
