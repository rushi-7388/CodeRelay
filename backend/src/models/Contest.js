import mongoose from "mongoose";

const contestProblemSchema = new mongoose.Schema({
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem",
    required: true,
  },
  points: {
    type: Number,
    default: 100,
  },
  order: {
    type: Number,
    default: 1,
  },
});

const contestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["individual", "team", "classroom"],
    default: "individual",
  },
  visibility: {
    type: String,
    enum: ["public", "private", "invite"],
    default: "public",
  },
  status: {
    type: String,
    enum: ["draft", "upcoming", "active", "completed", "archived"],
    default: "draft",
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  problems: [contestProblemSchema],
  settings: {
    showStandings: {
      type: Boolean,
      default: true,
    },
    showResults: {
      type: Boolean,
      default: true,
    },
    allowLateSubmission: {
      type: Boolean,
      default: false,
    },
    penaltyPerWrongSubmission: {
      type: Number,
      default: 0,
    },
    freezeTime: {
      type: Number,
      default: 0,
    },
    maxTeamSize: {
      type: Number,
      default: 1,
    },
    allowedLanguages: [{
      type: String,
    }],
  },
  participants: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      teamName: String,
      score: {
        type: Number,
        default: 0,
      },
      solvedProblems: [{
        problem: mongoose.Schema.Types.ObjectId,
        solvedAt: Date,
        attempts: Number,
        points: Number,
      }],
      rank: Number,
      lastSubmission: Date,
    },
  ],
  inviteCodes: [
    {
      code: String,
      maxUses: Number,
      usedCount: {
        type: Number,
        default: 0,
      },
      expiresAt: Date,
    },
  ],
}, { timestamps: true });

contestSchema.index({ status: 1, startTime: 1 });
contestSchema.index({ host: 1 });
contestSchema.index({ organization: 1 });

contestSchema.virtual("duration").get(function () {
  return (new Date(this.endTime) - new Date(this.startTime)) / (1000 * 60);
});

contestSchema.methods.calculateRankings = function () {
  const participants = this.participants.map(p => {
    const totalScore = p.solvedProblems.reduce((sum, sp) => sum + sp.points, 0);
    const penalty = p.solvedProblems.reduce((sum, sp) => {
      return sum + (sp.attempts - 1) * this.settings.penaltyPerWrongSubmission;
    }, 0);
    return {
      ...p.toObject(),
      totalScore: totalScore - penalty,
      lastSubmissionTime: p.solvedProblems.reduce((max, sp) => 
        sp.solvedAt > max ? sp.solvedAt : max, new Date(0)
      ),
    };
  });

  return participants.sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    return a.lastSubmissionTime - b.lastSubmissionTime;
  }).map((p, index) => ({ ...p, rank: index + 1 }));
};

const Contest = mongoose.model("Contest", contestSchema);

export default Contest;
