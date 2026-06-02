import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
  },
  category: {
    type: String,
    enum: ["submission", "streak", "contest", "social", "exploration", "mastery"],
    required: true,
  },
  criteria: {
    type: {
      type: String,
      enum: ["submissions", "accepted", "streak", "contest_rank", "problems_solved", "language", "difficulty", "referrals"],
      required: true,
    },
    threshold: {
      type: Number,
      required: true,
    },
    difficulty: String,
    language: String,
  },
  points: {
    type: Number,
    default: 0,
  },
  rarity: {
    type: String,
    enum: ["common", "rare", "epic", "legendary"],
    default: "common",
  },
  color: {
    type: String,
    default: "#6366f1",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

const userBadgeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  badge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Badge",
    required: true,
  },
  earnedAt: {
    type: Date,
    default: Date.now,
  },
  source: {
    type: String,
  },
});

const achievementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  icon: {
    type: String,
  },
  category: {
    type: String,
    enum: ["learning", "coding", "teaching", "community", "milestone"],
    required: true,
  },
  tier: {
    type: String,
    enum: ["bronze", "silver", "gold", "platinum", "diamond"],
    default: "bronze",
  },
  requirements: {
    metric: {
      type: String,
      required: true,
    },
    target: {
      type: Number,
      required: true,
    },
    timeframe: String,
  },
  rewards: {
    xp: {
      type: Number,
      default: 0,
    },
    coins: {
      type: Number,
      default: 0,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

const userAchievementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  achievement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Achievement",
    required: true,
  },
  progress: {
    type: Number,
    default: 0,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: Date,
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

const Badge = mongoose.model("Badge", badgeSchema);
const UserBadge = mongoose.model("UserBadge", userBadgeSchema);
const Achievement = mongoose.model("Achievement", achievementSchema);
const UserAchievement = mongoose.model("UserAchievement", userAchievementSchema);

export { Badge, UserBadge, Achievement, UserAchievement };
