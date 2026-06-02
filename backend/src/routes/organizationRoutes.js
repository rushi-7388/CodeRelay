import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  createOrganization,
  getOrganizations,
  getOrganization,
  updateOrganization,
  inviteMember,
  removeMember,
  switchOrganization,
  getOrganizationBySlug,
} from "../controllers/organizationController.js";

const router = express.Router();

router.post("/", protectRoute, createOrganization);
router.get("/", protectRoute, getOrganizations);
router.get("/slug/:slug", protectRoute, getOrganizationBySlug);
router.get("/:orgId", protectRoute, getOrganization);
router.put("/:orgId", protectRoute, updateOrganization);
router.post("/:orgId/invite", protectRoute, inviteMember);
router.delete("/:orgId/members/:memberId", protectRoute, removeMember);
router.post("/:orgId/switch", protectRoute, switchOrganization);

export default router;
