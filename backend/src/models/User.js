import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    endorsements: {
      type: Number,
      default: 0,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["student", "teacher", "admin", "superadmin"],
      default: "student",
    },
    organizations: [
      {
        org: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Organization",
        },
        role: {
          type: String,
          enum: ["owner", "admin", "teacher", "student"],
          default: "student",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    currentOrganization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
    preferences: {
      defaultLanguage: {
        type: String,
        default: "javascript",
      },
      theme: {
        type: String,
        default: "dark",
      },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
      },
    },
    stats: {
      totalSubmissions: { type: Number, default: 0 },
      acceptedSubmissions: { type: Number, default: 0 },
      totalTimeSpent: { type: Number, default: 0 },
      streak: { type: Number, default: 0 },
      lastActive: { type: Date },
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
