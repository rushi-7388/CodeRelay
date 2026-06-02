import User from "../models/User.js";
import Session from "../models/Session.js";
import CodeRun from "../models/CodeRun.js";

export async function getUserStats(req, res) {
    try {
        const userId = req.user._id;

        const totalSessions = await Session.countDocuments({
            $or: [{ host: userId }, { participant: userId }],
            status: "completed",
        });

        const totalCodeRuns = await CodeRun.countDocuments({ userId });

        const user = await User.findById(userId).select("-clerkId"); // Exclude sensitive info if needed

        res.status(200).json({
            success: true,
            stats: {
                totalSessions,
                totalCodeRuns,
                endorsements: user.endorsements,
            },
            profile: {
                bio: user.bio,
                skills: user.skills, // e.g. ["JavaScript", "React"]
                isAdmin: user.isAdmin,
            },
        });
    } catch (error) {
        console.log("Error in getUserStats:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function updateProfile(req, res) {
    try {
        const userId = req.user._id;
        const { bio, skills } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (bio !== undefined) user.bio = bio;
        if (skills !== undefined) user.skills = skills;

        await user.save();

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.log("Error in updateProfile:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getLeaderboard(req, res) {
    try {
        const topUsers = await Session.aggregate([
            {
                $match: {
                    status: "completed"
                }
            },
            {
                $group: {
                    _id: "$host",
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userInfo"
                }
            },
            {
                $unwind: "$userInfo"
            },
            {
                $project: {
                    _id: 1,
                    name: "$userInfo.name",
                    profileImage: "$userInfo.profileImage",
                    completedSessions: "$count"
                }
            },
            { $sort: { completedSessions: -1 } },
            { $limit: 10 }
        ]);

        res.status(200).json({ success: true, topUsers });
    } catch (error) {
        console.log("Error in getLeaderboard:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
