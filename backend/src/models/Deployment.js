import mongoose from "mongoose";

const deploymentSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    problemTitle: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      required: true,
    },
    category: {
      type: String,
    },
    deployer: {
      type: String, // Clerk ID or Name
      required: true,
    },
    // For random-looking but persistent slugs like "coderelay-37icky"
    slug: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);

const Deployment = mongoose.model("Deployment", deploymentSchema);

export default Deployment;
