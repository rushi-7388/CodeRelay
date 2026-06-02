import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { getPlans, createCheckoutSession, createPortalSession, getSubscription, cancelSubscription, handleWebhook } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/webhook", express.raw({ type: "application/json" }), handleWebhook);
router.get("/plans", getPlans);
router.post("/checkout", protectRoute, createCheckoutSession);
router.post("/portal", protectRoute, createPortalSession);
router.get("/subscription/:organizationId", protectRoute, getSubscription);
router.post("/subscription/:organizationId/cancel", protectRoute, cancelSubscription);

export default router;
