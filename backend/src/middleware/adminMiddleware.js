import { requireAuth } from "@clerk/express";
import User from "../models/User.js";

export const requireAdmin = [
    requireAuth(),
    async (req, res, next) => {
        try {
            const clerkId = req.auth().userId;

            if (!clerkId) {
                return res.status(401).json({ message: "Unauthorized - invalid token" });
            }

            // Check if user is in database and is admin
            const user = await User.findOne({ clerkId });

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            if (!user.isAdmin) {
                return res.status(403).json({ message: "Forbidden - Admin access required" });
            }

            // Attach user to req
            req.user = user;
            next();
        } catch (error) {
            console.error("Error in requireAdmin middleware", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    },
];
