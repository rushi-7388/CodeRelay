import User from "../models/User.js";
import Submission from "../models/Submission.js";
import Assignment from "../models/Assignment.js";
import Classroom from "../models/Classroom.js";
import Organization from "../models/Organization.js";

export async function syncUser(req, res) {
  try {
    const clerkId = req.auth().userId;
    const { email, firstName, lastName, imageUrl } = req.body;

    let user = await User.findOne({ clerkId });

    if (user) {
      user.name = firstName && lastName ? `${firstName} ${lastName}` : firstName || user.name;
      user.email = email || user.email;
      user.profileImage = imageUrl || user.profileImage;
      await user.save();
    } else {
      user = await User.create({
        clerkId,
        email,
        name: firstName && lastName ? `${firstName} ${lastName}` : firstName || email?.split("@")[0] || "User",
        profileImage: imageUrl || "",
      });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error syncing user:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getDashboard(req, res) {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    const isTeacher = user.role === "teacher" || user.organizations.some(o => ["owner", "admin", "teacher"].includes(o.role));

    let stats = {
      totalSubmissions: user.stats?.totalSubmissions || 0,
      acceptedSubmissions: user.stats?.acceptedSubmissions || 0,
      streak: user.stats?.streak || 0,
    };

    if (isTeacher) {
      const teacherOrganizations = user.organizations
        .filter(o => ["owner", "admin", "teacher"].includes(o.role))
        .map(o => o.org);

      const classrooms = await Classroom.find({
        teacher: userId,
        isArchived: false,
      });

      const classroomIds = classrooms.map(c => c._id);

      const assignments = await Assignment.find({
        classroom: { $in: classroomIds },
      });

      const assignmentIds = assignments.map(a => a._id);

      const submissions = await Submission.find({
        assignment: { $in: assignmentIds },
      });

      const uniqueStudents = new Set(submissions.map(s => s.student.toString())).size;

      stats = {
        ...stats,
        totalClassrooms: classrooms.length,
        totalAssignments: assignments.length,
        totalSubmissionsReceived: submissions.length,
        uniqueStudents,
        acceptanceRate: submissions.length > 0
          ? Math.round((submissions.filter(s => s.status === "accepted").length / submissions.length) * 100)
          : 0,
      };
    }

    const recentSubmissions = await Submission.find({ student: userId })
      .populate("problem", "title difficulty")
      .populate("assignment", "title")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({ success: true, stats, recentSubmissions, isTeacher });
  } catch (error) {
    console.error("Error fetching dashboard:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getLeaderboard(req, res) {
  try {
    const { classroomId, timeframe } = req.query;

    let query = {};

    if (classroomId) {
      const classroom = await Classroom.findById(classroomId);
      if (!classroom) {
        return res.status(404).json({ message: "Classroom not found" });
      }

      const assignments = await Assignment.find({ classroom: classroomId });
      const assignmentIds = assignments.map(a => a._id);

      query.assignment = { $in: assignmentIds };
      query.status = "accepted";
    }

    if (timeframe) {
      const now = new Date();
      let startDate;

      switch (timeframe) {
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "semester":
          startDate = new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        query.createdAt = { $gte: startDate };
      }
    }

    const leaderboardData = await Submission.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$student",
          totalScore: { $sum: "$score" },
          submissionCount: { $sum: 1 },
          acceptedCount: {
            $sum: { $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] },
          },
        },
      },
      { $sort: { totalScore: -1 } },
      { $limit: 50 },
    ]);

    const studentIds = leaderboardData.map(l => l._id);
    const students = await User.find({ _id: { $in: studentIds } })
      .select("name email profileImage");

    const studentMap = {};
    students.forEach(s => {
      studentMap[s._id.toString()] = s;
    });

    const leaderboard = leaderboardData.map((entry, index) => ({
      rank: index + 1,
      student: studentMap[entry._id.toString()],
      totalScore: entry.totalScore,
      submissionCount: entry.submissionCount,
      acceptedCount: entry.acceptedCount,
    }));

    res.status(200).json({ success: true, leaderboard });
  } catch (error) {
    console.error("Error fetching leaderboard:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getAnalytics(req, res) {
  try {
    const userId = req.user._id;
    const { classroomId, startDate, endDate } = req.query;

    const classroom = await Classroom.findById(classroomId);

    if (!classroom || classroom.teacher.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const matchQuery = {
      assignment: {
        $in: (await Assignment.find({ classroom: classroomId })).map(a => a._id),
      },
    };

    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    const submissions = await Submission.find(matchQuery)
      .populate("student", "name email")
      .populate("assignment", "title points");

    const totalSubmissions = submissions.length;
    const acceptedSubmissions = submissions.filter(s => s.status === "accepted").length;
    const pendingSubmissions = submissions.filter(s => s.status === "pending" || s.status === "running").length;

    const dailySubmissions = {};
    submissions.forEach(s => {
      const date = s.createdAt.toISOString().split("T")[0];
      dailySubmissions[date] = (dailySubmissions[date] || 0) + 1;
    });

    const difficultyBreakdown = {
      easy: { total: 0, accepted: 0 },
      medium: { total: 0, accepted: 0 },
      hard: { total: 0, accepted: 0 },
    };

    for (const sub of submissions) {
      const difficulty = sub.assignment?.problem?.difficulty?.toLowerCase() || "medium";
      if (difficultyBreakdown[difficulty]) {
        difficultyBreakdown[difficulty].total++;
        if (sub.status === "accepted") {
          difficultyBreakdown[difficulty].accepted++;
        }
      }
    }

    const studentPerformance = {};
    submissions.forEach(s => {
      const studentId = s.student._id.toString();
      if (!studentPerformance[studentId]) {
        studentPerformance[studentId] = {
          student: s.student,
          total: 0,
          accepted: 0,
          scores: [],
        };
      }
      studentPerformance[studentId].total++;
      if (s.status === "accepted") studentPerformance[studentId].accepted++;
      studentPerformance[studentId].scores.push(s.score);
    });

    const studentStats = Object.values(studentPerformance).map(sp => ({
      student: sp.student,
      total: sp.total,
      accepted: sp.accepted,
      acceptanceRate: sp.total > 0 ? Math.round((sp.accepted / sp.total) * 100) : 0,
      averageScore: sp.scores.length > 0
        ? Math.round(sp.scores.reduce((a, b) => a + b, 0) / sp.scores.length)
        : 0,
    })).sort((a, b) => b.averageScore - a.averageScore);

    res.status(200).json({
      success: true,
      analytics: {
        totalSubmissions,
        acceptedSubmissions,
        pendingSubmissions,
        acceptanceRate: totalSubmissions > 0
          ? Math.round((acceptedSubmissions / totalSubmissions) * 100)
          : 0,
        dailySubmissions,
        difficultyBreakdown,
        studentStats,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
