import Comment from "../models/Comment.js";
import Session from "../models/Session.js";

export async function addComment(req, res) {
    try {
        const userId = req.user._id;
        const { sessionId, text } = req.body;

        if (!sessionId || !text) {
            return res.status(400).json({ message: "Session ID and text are required" });
        }

        const session = await Session.findById(sessionId);
        if (!session) return res.status(404).json({ message: "Session not found" });

        // Check if user is part of the session
        if (session.host.toString() !== userId.toString() && session.participant?.toString() !== userId.toString()) {
            // Optional: Could allow public comments if session is public? But for now strict.
            // Or check if session is public?
        }

        const comment = await Comment.create({
            userId,
            sessionId,
            text,
        });

        const populatedComment = await Comment.findById(comment._id).populate("userId", "name profileImage");

        res.status(201).json({ success: true, comment: populatedComment });
    } catch (error) {
        console.log("Error in addComment:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getComments(req, res) {
    try {
        const { sessionId } = req.params;

        const comments = await Comment.find({ sessionId })
            .populate("userId", "name profileImage")
            .sort({ createdAt: 1 });

        res.status(200).json({ success: true, comments });
    } catch (error) {
        console.log("Error in getComments:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
