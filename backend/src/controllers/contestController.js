import Contest from "../models/Contest.js";
import Submission from "../models/Submission.js";
import Assignment from "../models/Assignment.js";

export async function createContest(req, res) {
  try {
    const userId = req.user._id;
    const { title, description, organizationId, type, visibility, startTime, endTime, problemIds, settings } = req.body;

    if (!title || !startTime || !endTime) {
      return res.status(400).json({ message: "Title, start time, and end time are required" });
    }

    const contest = await Contest.create({
      title,
      description,
      organization: organizationId,
      host: userId,
      type: type || "individual",
      visibility: visibility || "public",
      startTime,
      endTime,
      settings,
    });

    res.status(201).json({ success: true, contest });
  } catch (error) {
    console.error("Error creating contest:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getContests(req, res) {
  try {
    const userId = req.user._id;
    const { status, organizationId, page = 1, limit = 10 } = req.query;

    let query = {};

    if (status) {
      if (status === "upcoming") {
        query.startTime = { $gt: new Date() };
        query.status = { $in: ["draft", "upcoming"] };
      } else if (status === "active") {
        query.startTime = { $lte: new Date() };
        query.endTime = { $gte: new Date() };
        query.status = "active";
      } else if (status === "past") {
        query.endTime = { $lt: new Date() };
        query.status = "completed";
      } else {
        query.status = status;
      }
    }

    if (organizationId) {
      query.organization = organizationId;
    } else {
      query.$or = [
        { visibility: "public" },
        { host: userId },
        { "participants.user": userId },
      ];
    }

    const contests = await Contest.find(query)
      .populate("host", "name email profileImage")
      .populate("organization", "name slug")
      .sort({ startTime: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Contest.countDocuments(query);

    res.status(200).json({
      success: true,
      contests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching contests:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getContest(req, res) {
  try {
    const { contestId } = req.params;
    const userId = req.user._id;

    const contest = await Contest.findById(contestId)
      .populate("host", "name email profileImage")
      .populate("problems.problem")
      .populate("organization", "name slug");

    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    const isHost = contest.host._id.toString() === userId.toString();
    const isParticipant = contest.participants.some(p => p.user.toString() === userId.toString());

    const now = new Date();
    const contestStarted = now >= new Date(contest.startTime);
    const contestEnded = now >= new Date(contest.endTime);

    if (contest.visibility === "private" && !isHost && !isParticipant) {
      return res.status(403).json({ message: "Not authorized to view this contest" });
    }

    let userSubmission = null;
    if (isParticipant && contestEnded) {
      const participant = contest.participants.find(p => p.user.toString() === userId.toString());
      if (participant) {
        userSubmission = await Submission.find({
          assignment: { $in: contest.problems.map(p => p.problem._id) },
          student: userId,
        }).sort({ createdAt: -1 });
      }
    }

    res.status(200).json({
      success: true,
      contest,
      isHost,
      isParticipant,
      contestStarted,
      contestEnded,
      userSubmission,
    });
  } catch (error) {
    console.error("Error fetching contest:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function updateContest(req, res) {
  try {
    const { contestId } = req.params;
    const userId = req.user._id;
    const { title, description, startTime, endTime, settings, status } = req.body;

    const contest = await Contest.findById(contestId);

    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    if (contest.host.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the host can update this contest" });
    }

    if (title) contest.title = title;
    if (description !== undefined) contest.description = description;
    if (startTime) contest.startTime = startTime;
    if (endTime) contest.endTime = endTime;
    if (settings) contest.settings = { ...contest.settings, ...settings };
    if (status) contest.status = status;

    await contest.save();

    res.status(200).json({ success: true, contest });
  } catch (error) {
    console.error("Error updating contest:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function registerContest(req, res) {
  try {
    const { contestId } = req.params;
    const userId = req.user._id;
    const { teamName } = req.body;

    const contest = await Contest.findById(contestId);

    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    const now = new Date();
    if (now >= new Date(contest.startTime)) {
      return res.status(400).json({ message: "Registration closed - contest has started" });
    }

    const alreadyRegistered = contest.participants.some(p => p.user.toString() === userId.toString());
    if (alreadyRegistered) {
      return res.status(400).json({ message: "Already registered for this contest" });
    }

    if (contest.type === "team" && !teamName) {
      return res.status(400).json({ message: "Team name required for team contests" });
    }

    if (contest.settings.maxTeamSize > 1 && contest.type === "team") {
      return res.status(400).json({ message: "Team registration not fully implemented" });
    }

    contest.participants.push({
      user: userId,
      teamName: teamName || null,
      score: 0,
      solvedProblems: [],
      rank: 0,
    });

    await contest.save();

    res.status(200).json({ success: true, message: "Registered for contest" });
  } catch (error) {
    console.error("Error registering for contest:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getContestStandings(req, res) {
  try {
    const { contestId } = req.params;
    const { freeze } = req.query;

    const contest = await Contest.findById(contestId)
      .populate("participants.user", "name email profileImage");

    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    if (contest.visibility === "private") {
      const userId = req.user?._id;
      const isHost = contest.host.toString() === userId?.toString();
      const isParticipant = contest.participants.some(p => p.user.toString() === userId?.toString());
      if (!isHost && !isParticipant) {
        return res.status(403).json({ message: "Not authorized" });
      }
    }

    let participants = contest.participants.map(p => ({
      ...p.toObject(),
      user: p.user,
    }));

    const rankings = contest.calculateRankings();
    
    const freezeTime = contest.settings.freezeTime || 0;
    const freezeEnabled = freeze === "true" && freezeTime > 0;

    if (freezeEnabled) {
      const freezeEndTime = new Date(contest.endTime).getTime() - freezeTime * 60 * 1000;
      const now = Date.now();

      if (now < freezeEndTime) {
        rankings.forEach((r, i) => {
          const latestSubmission = r.solvedProblems?.reduce((max, sp) => 
            sp.solvedAt > max ? sp.solvedAt : max, new Date(0)
          );
          if (latestSubmission && new Date(latestSubmission).getTime() > freezeEndTime) {
            rankings[i] = {
              ...r,
              score: r.score,
              solvedProblems: r.solvedProblems.filter(sp => 
                new Date(sp.solvedAt).getTime() <= freezeEndTime
              ),
              isFrozen: true,
            };
          }
        });
      }
    }

    res.status(200).json({
      success: true,
      standings: rankings,
      contest: {
        title: contest.title,
        startTime: contest.startTime,
        endTime: contest.endTime,
        status: contest.status,
        freezeTime: contest.settings.freezeTime,
      },
    });
  } catch (error) {
    console.error("Error fetching standings:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function submitContestProblem(req, res) {
  try {
    const { contestId } = req.params;
    const userId = req.user._id;
    const { problemId, code, language } = req.body;

    const contest = await Contest.findById(contestId);

    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    const now = new Date();
    const contestEnded = now >= new Date(contest.endTime);
    
    if (contestEnded && !contest.settings.allowLateSubmission) {
      return res.status(400).json({ message: "Contest has ended" });
    }

    const participant = contest.participants.find(p => p.user.toString() === userId.toString());
    if (!participant) {
      return res.status(403).json({ message: "Not registered for this contest" });
    }

    const contestProblem = contest.problems.find(p => p.problem.toString() === problemId);
    if (!contestProblem) {
      return res.status(400).json({ message: "Problem not part of this contest" });
    }

    const alreadySolved = participant.solvedProblems.some(sp => sp.problem.toString() === problemId);
    if (alreadySolved) {
      return res.status(400).json({ message: "Problem already solved" });
    }

    const Problem = (await import("../models/Problem.js")).default;
    const problem = await Problem.findById(problemId);

    const SubmissionController = await import("../controllers/submissionController.js");
    const testResults = await SubmissionController.executeCode(code, language, problem.examples || []);

    const passedTests = testResults.filter(t => t.passed).length;
    const isAccepted = passedTests === testResults.length && testResults.length > 0;

    if (isAccepted) {
      const timeElapsed = (now - new Date(contest.startTime)) / (1000 * 60);
      participant.solvedProblems.push({
        problem: problemId,
        solvedAt: now,
        attempts: 1,
        points: contestProblem.points,
      });
      
      participant.score = participant.solvedProblems.reduce((sum, sp) => sum + sp.points, 0);
      participant.lastSubmission = now;

      await contest.save();
    }

    res.status(200).json({
      success: true,
      isAccepted,
      testResults,
      solvedProblems: participant.solvedProblems.length,
      score: participant.score,
    });
  } catch (error) {
    console.error("Error submitting contest problem:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function generateInviteCode(req, res) {
  try {
    const { contestId } = req.params;
    const userId = req.user._id;
    const { maxUses, expiresInHours } = req.body;

    const contest = await Contest.findById(contestId);

    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    if (contest.host.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only host can generate invite codes" });
    }

    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    contest.inviteCodes.push({
      code: inviteCode,
      maxUses: maxUses || null,
      expiresAt: expiresInHours 
        ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000)
        : null,
    });

    await contest.save();

    res.status(200).json({ success: true, inviteCode });
  } catch (error) {
    console.error("Error generating invite code:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function deleteContest(req, res) {
  try {
    const { contestId } = req.params;
    const userId = req.user._id;

    const contest = await Contest.findById(contestId);

    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    if (contest.host.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the host can delete this contest" });
    }

    await Contest.findByIdAndDelete(contestId);

    res.status(200).json({ success: true, message: "Contest deleted" });
  } catch (error) {
    console.error("Error deleting contest:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
