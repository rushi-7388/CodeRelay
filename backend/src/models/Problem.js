import mongoose from "mongoose";

const problemSchema = new mongoose.Schema(
    {
        // unique identifier slug like "two-sum"
        id: {
            type: String,
            required: true,
            unique: true,
        },
        title: {
            type: String,
            required: true,
        },
        difficulty: {
            type: String,
            enum: ["Easy", "Medium", "Hard"],
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        description: {
            text: { type: String, required: true },
            notes: [{ type: String }],
        },
        examples: [
            {
                input: { type: String, required: true },
                output: { type: String, required: true },
                explanation: { type: String },
            },
        ],
        constraints: [{ type: String }],
        starterCode: {
            type: Map,
            of: String,
        },
        expectedOutput: {
            type: Map,
            of: String,
        },
        hint: {
            type: String,
        },
    },
    { timestamps: true }
);

const Problem = mongoose.model("Problem", problemSchema);

export default Problem;
