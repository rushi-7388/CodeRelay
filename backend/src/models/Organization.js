import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
  },
  website: {
    type: String,
  },
  logo: {
    type: String,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
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
  plan: {
    type: String,
    enum: ["free", "starter", "pro", "enterprise"],
    default: "free",
  },
  settings: {
    allowPublicClasses: {
      type: Boolean,
      default: false,
    },
    requireApproval: {
      type: Boolean,
      default: true,
    },
    maxStudents: {
      type: Number,
      default: 50,
    },
    maxTeachers: {
      type: Number,
      default: 5,
    },
  },
  subscription: {
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    planEndDate: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
}, { timestamps: true });

organizationSchema.index({ owner: 1 });

const Organization = mongoose.model("Organization", organizationSchema);

export default Organization;
