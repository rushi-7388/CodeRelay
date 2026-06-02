import mongoose from "mongoose";

const classroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
  },
  subject: {
    type: String,
    required: true,
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  inviteCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  settings: {
    allowStudentChat: {
      type: Boolean,
      default: true,
    },
    allowStudentVideo: {
      type: Boolean,
      default: true,
    },
    showLeaderboard: {
      type: Boolean,
      default: true,
    },
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  semester: {
    type: String,
  },
  year: {
    type: Number,
  },
}, { timestamps: true });

classroomSchema.index({ organization: 1 });
classroomSchema.index({ teacher: 1 });

classroomSchema.pre("save", async function (next) {
  if (!this.inviteCode) {
    this.inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

const Classroom = mongoose.model("Classroom", classroomSchema);

export default Classroom;
