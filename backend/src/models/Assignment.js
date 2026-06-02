import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
  },
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Classroom",
    required: true,
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem",
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  dueDate: {
    type: Date,
  },
  points: {
    type: Number,
    default: 100,
  },
  settings: {
    allowLateSubmission: {
      type: Boolean,
      default: false,
    },
    latePenaltyPercent: {
      type: Number,
      default: 10,
    },
    allowResubmission: {
      type: Boolean,
      default: false,
    },
    maxAttempts: {
      type: Number,
      default: -1,
    },
    shuffleTestCases: {
      type: Boolean,
      default: false,
    },
    showResults: {
      type: String,
      enum: ["immediate", "after_due", "never"],
      default: "immediate",
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  allowedLanguages: [{
    type: String,
    enum: ["javascript", "python", "java", "cpp", "c", "go", "rust"],
  }],
}, { timestamps: true });

assignmentSchema.index({ classroom: 1 });
assignmentSchema.index({ problem: 1 });
assignmentSchema.index({ teacher: 1 });

const Assignment = mongoose.model("Assignment", assignmentSchema);

export default Assignment;
