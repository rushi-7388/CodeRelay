import express from "express";
import User from "../models/User.js";
import { Webhook } from "svix";
import { ENV } from "../lib/env.js";

const router = express.Router();

router.post("/clerk-webhook", async (req, res) => {
  try {
    const WEBHOOK_SECRET = ENV.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      return res.status(400).json({ message: "Webhook secret not configured" });
    }

    const headers = req.headers;
    const payload = JSON.stringify(req.body);

    const svix_id = headers["svix-id"];
    const svix_timestamp = headers["svix-timestamp"];
    const svix_signature = headers["svix-signature"];

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res.status(400).json({ message: "Missing svix headers" });
    }

    const wh = new Webhook(WEBHOOK_SECRET);
    let evt;

    try {
      evt = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err) {
      console.error("Webhook verification failed:", err.message);
      return res.status(400).json({ message: "Invalid signature" });
    }

    const eventType = evt.type;

    if (eventType === "user.created" || eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;
      const email = email_addresses?.[0]?.email_address;

      let user = await User.findOne({ clerkId: id });

      if (user) {
        user.name = first_name && last_name ? `${first_name} ${last_name}` : first_name || user.name;
        user.email = email || user.email;
        user.profileImage = image_url || user.profileImage;
        await user.save();
      } else {
        user = await User.create({
          clerkId: id,
          email,
          name: first_name && last_name ? `${first_name} ${last_name}` : first_name || email?.split("@")[0] || "User",
          profileImage: image_url || "",
        });
      }
    }

    if (eventType === "user.deleted") {
      const { id } = evt.data;
      await User.findOneAndDelete({ clerkId: id });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in clerk webhook:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
