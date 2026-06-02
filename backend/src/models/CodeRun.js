import mongoose from "mongoose";

const codeRunSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Session",
            default: null, // Can be run outside session
        },
        problemTitle: {
            type: String,
            required: true,
        },
        language: {
            type: String,
            required: true,
        },
        code: {
            type: String,
            required: true,
        },
        output: {
            type: String,
            default: "",
        },
        status: {
            type: String, // "success" or "error"
            enum: ["success", "error"],
            default: "success",
        },
        executionTime: {
            type: Number, // In milliseconds
            default: 0,
        },
    },
    { timestamps: true }
);

const CodeRun = mongoose.model("CodeRun", codeRunSchema);

export default CodeRun;
