import mongoose from "mongoose";

const testCaseResultSchema = new mongoose.Schema({
  input: String,
  expectedOutput: String,
  actualOutput: String,
  passed: Boolean,
  executionTime: Number,
  memory: Number,
  error: String,
}, { _id: false });

const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assignment",
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem",
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
    enum: ["javascript", "python", "java", "cpp", "c", "go", "rust"],
  },
  status: {
    type: String,
    enum: ["pending", "running", "accepted", "wrong_answer", "time_limit_exceeded", "runtime_error", "compilation_error"],
    default: "pending",
  },
  score: {
    type: Number,
    default: 0,
  },
  totalPoints: {
    type: Number,
    default: 100,
  },
  testResults: [testCaseResultSchema],
  submissionNumber: {
    type: Number,
    default: 1,
  },
  isLate: {
    type: Boolean,
    default: false,
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  gradedAt: {
    type: Date,
  },
  feedback: {
    type: String,
  },
}, { timestamps: true });

submissionSchema.index({ assignment: 1, student: 1 });
submissionSchema.index({ student: 1, createdAt: -1 });
submissionSchema.index({ assignment: 1 });

const Submission = mongoose.model("Submission", submissionSchema);

export default Submission;
