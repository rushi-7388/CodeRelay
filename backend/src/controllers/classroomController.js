import Classroom from "../models/Classroom.js";
import Organization from "../models/Organization.js";
import User from "../models/User.js";

export async function createClassroom(req, res) {
  try {
    const userId = req.user._id;
    const { name, description, subject, organizationId, semester, year, settings } = req.body;

    if (!name || !subject || !organizationId) {
      return res.status(400).json({ message: "Name, subject, and organization are required" });
    }

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const userMember = organization.members.find(
      m => m.user.toString() === userId.toString() && ["owner", "admin", "teacher"].includes(m.role)
    );

    if (!userMember) {
      return res.status(403).json({ message: "Not authorized to create classrooms" });
    }

    const classroom = await Classroom.create({
      name,
      description,
      subject,
      organization: organizationId,
      teacher: userId,
      semester,
      year,
      settings,
    });

    classroom.students.push(userId);
    await classroom.save();

    res.status(201).json({ success: true, classroom });
  } catch (error) {
    console.error("Error creating classroom:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getClassrooms(req, res) {
  try {
    const userId = req.user._id;
    const { organizationId, asTeacher, asStudent } = req.query;

    let query = { isArchived: false };

    if (organizationId) {
      query.organization = organizationId;
    }

    if (asTeacher === "true") {
      query.teacher = userId;
    } else if (asStudent === "true") {
      query.students = userId;
    } else {
      query.$or = [{ teacher: userId }, { students: userId }];
    }

    const classrooms = await Classroom.find(query)
      .populate("teacher", "name email profileImage")
      .populate("organization", "name slug")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, classrooms });
  } catch (error) {
    console.error("Error fetching classrooms:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getClassroom(req, res) {
  try {
    const { classroomId } = req.params;
    const userId = req.user._id;

    const classroom = await Classroom.findById(classroomId)
      .populate("teacher", "name email profileImage")
      .populate("organization", "name slug")
      .populate("students", "name email profileImage stats");

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    const isTeacher = classroom.teacher._id.toString() === userId.toString();
    const isStudent = classroom.students.some(s => s._id.toString() === userId.toString());

    if (!isTeacher && !isStudent) {
      const org = await Organization.findById(classroom.organization);
      const userMember = org?.members.find(m => m.user.toString() === userId.toString());
      if (!userMember) {
        return res.status(403).json({ message: "Not authorized to view this classroom" });
      }
    }

    res.status(200).json({ success: true, classroom, isTeacher, isStudent });
  } catch (error) {
    console.error("Error fetching classroom:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function updateClassroom(req, res) {
  try {
    const { classroomId } = req.params;
    const userId = req.user._id;
    const { name, description, subject, settings, isArchived } = req.body;

    const classroom = await Classroom.findById(classroomId);

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    if (classroom.teacher.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the teacher can update this classroom" });
    }

    if (name) classroom.name = name;
    if (description !== undefined) classroom.description = description;
    if (subject) classroom.subject = subject;
    if (settings) classroom.settings = { ...classroom.settings, ...settings };
    if (isArchived !== undefined) classroom.isArchived = isArchived;

    await classroom.save();

    res.status(200).json({ success: true, classroom });
  } catch (error) {
    console.error("Error updating classroom:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function joinClassroom(req, res) {
  try {
    const { inviteCode } = req.body;
    const userId = req.user._id;

    if (!inviteCode) {
      return res.status(400).json({ message: "Invite code is required" });
    }

    const classroom = await Classroom.findOne({ inviteCode: inviteCode.toUpperCase() });

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found with this invite code" });
    }

    if (classroom.isArchived) {
      return res.status(400).json({ message: "This classroom is archived" });
    }

    if (classroom.students.includes(userId)) {
      return res.status(400).json({ message: "You are already in this classroom" });
    }

    classroom.students.push(userId);
    await classroom.save();

    res.status(200).json({ success: true, classroom });
  } catch (error) {
    console.error("Error joining classroom:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function leaveClassroom(req, res) {
  try {
    const { classroomId } = req.params;
    const userId = req.user._id;

    const classroom = await Classroom.findById(classroomId);

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    if (classroom.teacher.toString() === userId.toString()) {
      return res.status(400).json({ message: "Teacher cannot leave their own classroom. Archive it instead." });
    }

    classroom.students = classroom.students.filter(s => s.toString() !== userId.toString());
    await classroom.save();

    res.status(200).json({ success: true, message: "Left classroom successfully" });
  } catch (error) {
    console.error("Error leaving classroom:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function removeStudent(req, res) {
  try {
    const { classroomId, studentId } = req.params;
    const userId = req.user._id;

    const classroom = await Classroom.findById(classroomId);

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    if (classroom.teacher.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the teacher can remove students" });
    }

    classroom.students = classroom.students.filter(s => s.toString() !== studentId);
    await classroom.save();

    res.status(200).json({ success: true, message: "Student removed successfully" });
  } catch (error) {
    console.error("Error removing student:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function regenerateInviteCode(req, res) {
  try {
    const { classroomId } = req.params;
    const userId = req.user._id;

    const classroom = await Classroom.findById(classroomId);

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    if (classroom.teacher.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the teacher can regenerate invite code" });
    }

    classroom.inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    await classroom.save();

    res.status(200).json({ success: true, inviteCode: classroom.inviteCode });
  } catch (error) {
    console.error("Error regenerating invite code:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
