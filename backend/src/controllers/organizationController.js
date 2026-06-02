import Organization from "../models/Organization.js";
import User from "../models/User.js";

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    + "-" + Math.random().toString(36).substring(2, 6);
}

export async function createOrganization(req, res) {
  try {
    const userId = req.user._id;
    const { name, description, website } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Organization name is required" });
    }

    let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const existingOrg = await Organization.findOne({ slug });
    if (existingOrg) {
      slug = generateSlug(name);
    }

    const organization = await Organization.create({
      name,
      slug,
      description,
      website,
      owner: userId,
      members: [{ user: userId, role: "owner" }],
    });

    await User.findByIdAndUpdate(userId, {
      $push: { organizations: { org: organization._id, role: "owner" } },
      currentOrganization: organization._id,
    });

    res.status(201).json({ success: true, organization });
  } catch (error) {
    console.error("Error creating organization:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getOrganizations(req, res) {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId).populate("organizations.org");
    const orgIds = user.organizations.map(o => o.org._id);
    
    const organizations = await Organization.find({ _id: { $in: orgIds } });
    
    res.status(200).json({ success: true, organizations });
  } catch (error) {
    console.error("Error fetching organizations:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getOrganization(req, res) {
  try {
    const { orgId } = req.params;
    
    const organization = await Organization.findById(orgId)
      .populate("members.user", "name email profileImage role")
      .populate("owner", "name email");
    
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }
    
    res.status(200).json({ success: true, organization });
  } catch (error) {
    console.error("Error fetching organization:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function updateOrganization(req, res) {
  try {
    const { orgId } = req.params;
    const userId = req.user._id;
    const { name, description, website, logo, settings } = req.body;
    
    const organization = await Organization.findById(orgId);
    
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }
    
    const userMember = organization.members.find(
      m => m.user.toString() === userId.toString() && ["owner", "admin"].includes(m.role)
    );
    
    if (!userMember) {
      return res.status(403).json({ message: "Not authorized to update this organization" });
    }
    
    if (name) organization.name = name;
    if (description !== undefined) organization.description = description;
    if (website !== undefined) organization.website = website;
    if (logo !== undefined) organization.logo = logo;
    if (settings) organization.settings = { ...organization.settings, ...settings };
    
    await organization.save();
    
    res.status(200).json({ success: true, organization });
  } catch (error) {
    console.error("Error updating organization:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function inviteMember(req, res) {
  try {
    const { orgId } = req.params;
    const { email, role } = req.body;
    const userId = req.user._id;
    
    const organization = await Organization.findById(orgId);
    
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }
    
    const userMember = organization.members.find(
      m => m.user.toString() === userId.toString() && ["owner", "admin"].includes(m.role)
    );
    
    if (!userMember) {
      return res.status(403).json({ message: "Not authorized to invite members" });
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: "User not found. They must sign up first." });
    }
    
    const existingMember = organization.members.find(m => m.user.toString() === user._id.toString());
    if (existingMember) {
      return res.status(400).json({ message: "User is already a member" });
    }
    
    organization.members.push({ user: user._id, role: role || "student" });
    await organization.save();
    
    await User.findByIdAndUpdate(user._id, {
      $push: { organizations: { org: organization._id, role: role || "student" } },
    });
    
    res.status(200).json({ success: true, message: "Member invited successfully" });
  } catch (error) {
    console.error("Error inviting member:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function removeMember(req, res) {
  try {
    const { orgId, memberId } = req.params;
    const userId = req.user._id;
    
    const organization = await Organization.findById(orgId);
    
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }
    
    const userMember = organization.members.find(
      m => m.user.toString() === userId.toString() && ["owner", "admin"].includes(m.role)
    );
    
    if (!userMember) {
      return res.status(403).json({ message: "Not authorized to remove members" });
    }
    
    if (memberId === userId.toString()) {
      return res.status(400).json({ message: "Cannot remove yourself" });
    }
    
    organization.members = organization.members.filter(m => m.user.toString() !== memberId);
    await organization.save();
    
    await User.findByIdAndUpdate(memberId, {
      $pull: { organizations: { org: organization._id } },
    });
    
    res.status(200).json({ success: true, message: "Member removed successfully" });
  } catch (error) {
    console.error("Error removing member:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function switchOrganization(req, res) {
  try {
    const { orgId } = req.params;
    const userId = req.user._id;
    
    const user = await User.findById(userId);
    
    const isMember = user.organizations.some(o => o.org.toString() === orgId);
    
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this organization" });
    }
    
    await User.findByIdAndUpdate(userId, { currentOrganization: orgId });
    
    res.status(200).json({ success: true, message: "Switched organization successfully" });
  } catch (error) {
    console.error("Error switching organization:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getOrganizationBySlug(req, res) {
  try {
    const { slug } = req.params;
    
    const organization = await Organization.findOne({ slug })
      .select("name slug description logo website settings");
    
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }
    
    res.status(200).json({ success: true, organization });
  } catch (error) {
    console.error("Error fetching organization:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
