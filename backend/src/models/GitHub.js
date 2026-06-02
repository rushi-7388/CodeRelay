import mongoose from "mongoose";

const githubRepoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  githubId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  description: String,
  private: {
    type: Boolean,
    default: false,
  },
  htmlUrl: {
    type: String,
  },
  defaultBranch: {
    type: String,
    default: "main",
  },
  language: String,
  stargazersCount: {
    type: Number,
    default: 0,
  },
  forksCount: {
    type: Number,
    default: 0,
  },
  lastSyncedAt: Date,
  syncedProblems: [
    {
      problem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
      },
      path: String,
      syncedAt: Date,
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

const githubCommitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  repo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GitHubRepo",
    required: true,
  },
  sha: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  author: {
    name: String,
    email: String,
    date: Date,
  },
  additions: {
    type: Number,
    default: 0,
  },
  deletions: {
    type: Number,
    default: 0,
  },
  url: String,
}, { timestamps: true });

const githubIntegrationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  githubAccessToken: {
    type: String,
    select: false,
  },
  githubId: {
    type: String,
  },
  login: {
    type: String,
  },
  name: String,
  email: String,
  avatarUrl: String,
  bio: String,
  company: String,
  location: String,
  blog: String,
  publicRepos: {
    type: Number,
    default: 0,
  },
  followers: {
    type: Number,
    default: 0,
  },
  following: {
    type: Number,
    default: 0,
  },
  repos: [githubRepoSchema],
  scope: [String],
  connectedAt: {
    type: Date,
    default: Date.now,
  },
  lastSyncAt: Date,
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

githubIntegrationSchema.index({ user: 1 });
githubIntegrationSchema.index({ githubId: 1 });

const GitHubIntegration = mongoose.model("GitHubIntegration", githubIntegrationSchema);
const GitHubRepo = mongoose.model("GitHubRepo", githubRepoSchema);
const GitHubCommit = mongoose.model("GitHubCommit", githubCommitSchema);

export { GitHubIntegration, GitHubRepo, GitHubCommit };
