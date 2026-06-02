import Assignment from "../models/Assignment.js";
import Classroom from "../models/Classroom.js";
import Submission from "../models/Submission.js";

export async function createAssignment(req, res) {
  try {
    const userId = req.user._id;
    const { title, description, classroomId, problemId, dueDate, points, settings, allowedLanguages } = req.body;

    if (!title || !classroomId || !problemId) {
      return res.status(400).json({ message: "Title, classroom, and problem are required" });
    }

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    if (classroom.teacher.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the classroom teacher can create assignments" });
    }

    const assignment = await Assignment.create({
      title,
      description,
      classroom: classroomId,
      problem: problemId,
      teacher: userId,
      dueDate,
      points,
      settings,
      allowedLanguages: allowedLanguages || ["javascript", "python", "java"],
    });

    await assignment.populate([
      { path: "problem", select: "title difficulty category" },
      { path: "classroom", select: "name subject" },
    ]);

    res.status(201).json({ success: true, assignment });
  } catch (error) {
    console.error("Error creating assignment:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getAssignments(req, res) {
  try {
    const userId = req.user._id;
    const { classroomId, status } = req.query;

    let query = {};

    if (classroomId) {
      const classroom = await Classroom.findById(classroomId);
      if (!classroom) {
        return res.status(404).json({ message: "Classroom not found" });
      }

      const isTeacher = classroom.teacher.toString() === userId.toString();
      const isStudent = classroom.students.includes(userId);

      if (!isTeacher && !isStudent) {
        return res.status(403).json({ message: "Not authorized to view assignments" });
      }

      query.classroom = classroomId;
    } else {
      const classrooms = await Classroom.find({
        $or: [{ teacher: userId }, { students: userId }],
        isArchived: false,
      });
      const classroomIds = classrooms.map(c => c._id);
      query.classroom = { $in: classroomIds };
    }

    const assignments = await Assignment.find(query)
      .populate("problem", "title difficulty category")
      .populate("classroom", "name subject teacher")
      .sort({ dueDate: 1, createdAt: -1 });

    const assignmentsWithStatus = assignments.map(assignment => {
      const now = new Date();
      const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
      let assignmentStatus = "upcoming";

      if (dueDate && dueDate < now && assignment.settings.isPublished) {
        assignmentStatus = "past_due";
      }

      if (status && assignmentStatus !== status) {
        return null;
      }

      return { ...assignment.toObject(), status: assignmentStatus };
    }).filter(Boolean);

    res.status(200).json({ success: true, assignments: assignmentsWithStatus });
  } catch (error) {
    console.error("Error fetching assignments:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getAssignment(req, res) {
  try {
    const { assignmentId } = req.params;
    const userId = req.user._id;

    const assignment = await Assignment.findById(assignmentId)
      .populate("problem")
      .populate("classroom", "name subject teacher students");

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const classroom = assignment.classroom;
    const isTeacher = classroom.teacher.toString() === userId.toString();
    const isStudent = classroom.students.some(s => s.toString() === userId.toString());

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ message: "Not authorized to view this assignment" });
    }

    if (!isTeacher) {
      const submission = await Submission.findOne({
        assignment: assignmentId,
        student: userId,
      }).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        assignment,
        isTeacher,
        submission,
      });
    }

    res.status(200).json({ success: true, assignment, isTeacher });
  } catch (error) {
    console.error("Error fetching assignment:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function updateAssignment(req, res) {
  try {
    const { assignmentId } = req.params;
    const userId = req.user._id;
    const { title, description, dueDate, points, settings, allowedLanguages, isPublished } = req.body;

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (assignment.teacher.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the teacher can update this assignment" });
    }

    if (title) assignment.title = title;
    if (description !== undefined) assignment.description = description;
    if (dueDate) assignment.dueDate = dueDate;
    if (points) assignment.points = points;
    if (allowedLanguages) assignment.allowedLanguages = allowedLanguages;
    if (settings) assignment.settings = { ...assignment.settings, ...settings };
    if (isPublished !== undefined) assignment.settings.isPublished = isPublished;

    await assignment.save();

    await assignment.populate([
      { path: "problem", select: "title difficulty category" },
      { path: "classroom", select: "name subject" },
    ]);

    res.status(200).json({ success: true, assignment });
  } catch (error) {
    console.error("Error updating assignment:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function deleteAssignment(req, res) {
  try {
    const { assignmentId } = req.params;
    const userId = req.user._id;

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (assignment.teacher.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the teacher can delete this assignment" });
    }

    await Submission.deleteMany({ assignment: assignmentId });
    await Assignment.findByIdAndDelete(assignmentId);

    res.status(200).json({ success: true, message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("Error deleting assignment:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getAssignmentSubmissions(req, res) {
  try {
    const { assignmentId } = req.params;
    const userId = req.user._id;

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (assignment.teacher.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the teacher can view all submissions" });
    }

    const submissions = await Submission.find({ assignment: assignmentId })
      .populate("student", "name email profileImage")
      .sort({ createdAt: -1 });

    const stats = {
      total: submissions.length,
      accepted: submissions.filter(s => s.status === "accepted").length,
      pending: submissions.filter(s => s.status === "pending" || s.status === "running").length,
      graded: submissions.filter(s => s.status !== "pending" && s.status !== "running").length,
    };

    res.status(200).json({ success: true, submissions, stats });
  } catch (error) {
    console.error("Error fetching submissions:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
