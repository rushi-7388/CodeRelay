import Deployment from "../models/Deployment.js";

export const createDeployment = async (req, res) => {
  try {
    const { sessionId, code, language, problemTitle, difficulty, category, deployer } = req.body;

    // Generate a unique slug: coderelay-xxxxxx
    const randomPart = Math.random().toString(36).substring(2, 8);
    const slug = `coderelay-${randomPart}`;

    const deployment = new Deployment({
      sessionId,
      code,
      language,
      problemTitle,
      difficulty,
      category,
      deployer,
      slug,
    });

    await deployment.save();

    res.status(201).json({
      success: true,
      deployment,
    });
  } catch (error) {
    console.error("Error creating deployment:", error);
    res.status(500).json({ message: "Failed to create deployment" });
  }
};

export const getDeploymentBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const deployment = await Deployment.findOne({ slug });

    if (!deployment) {
      return res.status(404).json({ message: "Deployment not found" });
    }

    res.status(200).json({
      success: true,
      deployment,
    });
  } catch (error) {
    console.error("Error fetching deployment:", error);
    res.status(500).json({ message: "Failed to fetch deployment" });
  }
};

export const getDeploymentBySessionId = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const deployments = await Deployment.find({ sessionId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      deployments,
    });
  } catch (error) {
    console.error("Error fetching deployments by session:", error);
    res.status(500).json({ message: "Failed to fetch deployments" });
  }
};

// Mock code execution for the preview page (can be upgraded to real execution)
export const testCodeExecution = async (req, res) => {
    try {
        const { slug } = req.params;
        const deployment = await Deployment.findOne({ slug });
        
        if (!deployment) {
            return res.status(404).json({ message: "Deployment not found" });
        }

        // For now, we return a success message or simulated output
        // In a real scenario, this would call the Piston API or run the code in a sandbox
        res.status(200).json({
            success: true,
            output: `Successfully executed ${deployment.language} code for ${deployment.problemTitle}.\n\nOutput: [Simulated Success]`,
        });
    } catch (error) {
        res.status(500).json({ message: "Execution failed" });
    }
}
