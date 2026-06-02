import Submission from "../models/Submission.js";
import Assignment from "../models/Assignment.js";
import User from "../models/User.js";

const LANGUAGE_CONFIG = {
  javascript: { extension: "js", compileCmd: null, runCmd: (file) => `node ${file}`, timeout: 5000 },
  python: { extension: "py", compileCmd: null, runCmd: (file) => `python3 ${file}`, timeout: 5000 },
  java: { extension: "java", compileCmd: (file) => `javac ${file}`, runCmd: (file, className) => `java -cp . ${className}`, timeout: 10000 },
  cpp: { extension: "cpp", compileCmd: (file) => `g++ -O2 ${file} -o a.out`, runCmd: () => `./a.out`, timeout: 5000 },
  c: { extension: "c", compileCmd: (file) => `gcc -O2 ${file} -o a.out`, runCmd: () => `./a.out`, timeout: 5000 },
  rust: { extension: "rs", compileCmd: (file) => `rustc ${file} -o a.out`, runCmd: () => `./a.out`, timeout: 5000 },
  go: { extension: "go", compileCmd: (file) => `go build -o a.out ${file}`, runCmd: () => `./a.out`, timeout: 5000 },
  csharp: { extension: "cs", compileCmd: (file) => `mcs ${file}`, runCmd: (file) => `mono ${file.replace('.cs', '.exe')}`, timeout: 5000 },
  ruby: { extension: "rb", compileCmd: null, runCmd: (file) => `ruby ${file}`, timeout: 5000 },
  php: { extension: "php", compileCmd: null, runCmd: (file) => `php ${file}`, timeout: 5000 },
  swift: { extension: "swift", compileCmd: (file) => `swiftc ${file} -o a.out`, runCmd: () => `./a.out`, timeout: 5000 },
  kotlin: { extension: "kt", compileCmd: (file) => `kotlinc ${file} -include-runtime -d a.jar`, runCmd: () => `java -jar a.jar`, timeout: 10000 },
  sql: { extension: "sql", compileCmd: null, runCmd: (file) => `sqlite3 < ${file}`, timeout: 5000 },
  typescript: { extension: "ts", compileCmd: null, runCmd: (file) => `ts-node ${file}`, timeout: 5000 },
};

async function executeCode(code, language, testCases) {
  const fs = await import("fs");
  const { exec } = await import("child_process");
  const { promisify } = await import("util");
  const execAsync = promisify(exec);
  const path = await import("path");
  const os = await import("os");

  const results = [];
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "code-run-"));

  try {
    const config = LANGUAGE_CONFIG[language];
    if (!config) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const className = "Main";

    let fullCode = code;
    if (language === "java") {
      fullCode = code.includes("public class Main") ? code : `public class Main {\n${code}\n}`;
    }

    const fileName = language === "java" ? "Main.java" : `Main.${config.extension}`;
    const filePath = path.join(tempDir, fileName);

    fs.writeFileSync(filePath, fullCode);

    if (config.compileCmd) {
      await execAsync(config.compileCmd(filePath), { cwd: tempDir, timeout: 10000 });
    }

    for (const testCase of testCases) {
      try {
        let inputFile, inputArg;
        
        if (testCase.input && testCase.input.trim()) {
          inputFile = path.join(tempDir, "input.txt");
          fs.writeFileSync(inputFile, testCase.input);
          inputArg = `< ${inputFile}`;
        } else {
          inputArg = "";
        }

        const startTime = Date.now();
        const { stdout, stderr } = await execAsync(
          config.runCmd(filePath, className) + (inputArg ? ` ${inputArg}` : ""),
          { cwd: tempDir, timeout: config.timeout }
        );
        const executionTime = Date.now() - startTime;

        const actualOutput = stdout.trim();
        const expectedOutput = testCase.expectedOutput?.trim() || testCase.output?.trim() || "";
        const passed = actualOutput === expectedOutput;

        results.push({
          input: testCase.input,
          expectedOutput,
          actualOutput,
          passed,
          executionTime,
          memory: 0,
        });
      } catch (error) {
        results.push({
          input: testCase.input,
          expectedOutput: testCase.expectedOutput?.trim() || testCase.output?.trim() || "",
          actualOutput: "",
          passed: false,
          executionTime: 0,
          error: error.message || "Runtime error",
        });
      }
    }
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  return results;
}

export async function submitCode(req, res) {
  try {
    const userId = req.user._id;
    const { assignmentId, code, language } = req.body;

    if (!assignmentId || !code || !language) {
      return res.status(400).json({ message: "Assignment, code, and language are required" });
    }

    const assignment = await Assignment.findById(assignmentId)
      .populate("problem");

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const Classroom = (await import("../models/Classroom.js")).default;
    const classroom = await Classroom.findById(assignment.classroom);
    const isStudent = classroom.students.includes(userId);

    if (!isStudent) {
      return res.status(403).json({ message: "Only students can submit to this assignment" });
    }

    if (!assignment.allowedLanguages.includes(language)) {
      return res.status(400).json({ message: "This language is not allowed for this assignment" });
    }

    const previousSubmissions = await Submission.countDocuments({
      assignment: assignmentId,
      student: userId,
    });

    if (assignment.settings.maxAttempts !== -1 && 
        previousSubmissions >= assignment.settings.maxAttempts) {
      return res.status(400).json({ 
        message: `Maximum attempts (${assignment.settings.maxAttempts}) reached` 
      });
    }

    const now = new Date();
    const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
    const isLate = dueDate && now > dueDate;

    if (isLate && !assignment.settings.allowLateSubmission) {
      return res.status(400).json({ message: "Submission deadline has passed" });
    }

    const submission = await Submission.create({
      assignment: assignmentId,
      student: userId,
      problem: assignment.problem._id,
      code,
      language,
      status: "running",
      totalPoints: assignment.points,
      submissionNumber: previousSubmissions + 1,
      isLate,
    });

    const testCases = assignment.problem.examples || [];
    if (assignment.problem.constraints) {
      testCases.push(...assignment.problem.constraints.map(c => ({ input: "", expectedOutput: c })));
    }

    const testResults = await executeCode(code, language, testCases);

    const passedTests = testResults.filter(t => t.passed).length;
    const totalTests = testResults.length;
    const score = totalTests > 0 ? Math.round((passedTests / totalTests) * assignment.points) : 0;

    let status = "wrong_answer";
    if (passedTests === totalTests && totalTests > 0) {
      status = "accepted";
    } else if (testResults.some(t => t.error?.includes("Time"))) {
      status = "time_limit_exceeded";
    } else if (testResults.some(t => t.error)) {
      status = "runtime_error";
    }

    submission.status = status;
    submission.score = score;
    submission.testResults = testResults;
    submission.gradedAt = new Date();

    if (isLate && assignment.settings.latePenaltyPercent > 0) {
      const penalty = Math.round(score * (assignment.settings.latePenaltyPercent / 100));
      submission.score = Math.max(0, score - penalty);
    }

    await submission.save();

    await User.findByIdAndUpdate(userId, {
      $inc: { "stats.totalSubmissions": 1 },
      $set: { "stats.lastActive": new Date() },
    });

    if (status === "accepted") {
      await User.findByIdAndUpdate(userId, {
        $inc: { "stats.acceptedSubmissions": 1 },
      });
    }

    res.status(201).json({ success: true, submission });
  } catch (error) {
    console.error("Error submitting code:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getSubmissions(req, res) {
  try {
    const userId = req.user._id;
    const { assignmentId, studentId } = req.query;

    let query = {};

    if (assignmentId) {
      query.assignment = assignmentId;
    }

    if (studentId) {
      query.student = studentId;
    } else {
      query.student = userId;
    }

    const submissions = await Submission.find(query)
      .populate("assignment", "title dueDate points")
      .populate("problem", "title difficulty")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ success: true, submissions });
  } catch (error) {
    console.error("Error fetching submissions:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getSubmission(req, res) {
  try {
    const { submissionId } = req.params;
    const userId = req.user._id;

    const submission = await Submission.findById(submissionId)
      .populate("assignment")
      .populate("problem")
      .populate("student", "name email profileImage");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const AssignmentModel = (await import("../models/Assignment.js")).default;
    const assignment = await AssignmentModel.findById(submission.assignment);
    const Classroom = (await import("../models/Classroom.js")).default;
    const classroom = await Classroom.findById(assignment.classroom);

    const isTeacher = classroom.teacher.toString() === userId.toString();
    const isStudent = submission.student._id.toString() === userId.toString();

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ message: "Not authorized to view this submission" });
    }

    res.status(200).json({ success: true, submission, isTeacher });
  } catch (error) {
    console.error("Error fetching submission:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function gradeSubmission(req, res) {
  try {
    const { submissionId } = req.params;
    const userId = req.user._id;
    const { score, feedback } = req.body;

    if (score === undefined) {
      return res.status(400).json({ message: "Score is required" });
    }

    const submission = await Submission.findById(submissionId)
      .populate({
        path: "assignment",
        populate: { path: "classroom" },
      });

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const classroom = submission.assignment.classroom;
    if (classroom.teacher.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the teacher can grade submissions" });
    }

    submission.score = score;
    submission.feedback = feedback;
    submission.gradedBy = userId;
    submission.gradedAt = new Date();

    if (score >= submission.assignment.points * 0.7) {
      submission.status = "accepted";
    } else {
      submission.status = "wrong_answer";
    }

    await submission.save();

    res.status(200).json({ success: true, submission });
  } catch (error) {
    console.error("Error grading submission:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getStudentProgress(req, res) {
  try {
    const { classroomId } = req.params;
    const userId = req.user._id;

    const Classroom = (await import("../models/Classroom.js")).default;
    const classroom = await Classroom.findById(classroomId);

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    if (classroom.teacher.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the teacher can view student progress" });
    }

    const assignments = await Assignment.find({ classroom: classroomId })
      .populate("problem", "title difficulty");

    const assignmentIds = assignments.map(a => a._id);

    const studentProgress = await Promise.all(
      classroom.students.map(async (studentId) => {
        const submissions = await Submission.find({
          assignment: { $in: assignmentIds },
          student: studentId,
        }).sort({ createdAt: -1 });

        const user = await User.findById(studentId).select("name email profileImage stats");

        const completedAssignments = new Set(
          submissions.filter(s => s.status === "accepted").map(s => s.assignment.toString())
        );

        const totalScore = submissions.reduce((sum, s) => sum + s.score, 0);
        const maxPossibleScore = assignments.reduce((sum, a) => sum + a.points, 0);

        return {
          student: user,
          submissionsCount: submissions.length,
          completedAssignments: completedAssignments.size,
          totalAssignments: assignments.length,
          totalScore,
          maxPossibleScore,
          averageScore: submissions.length > 0 ? Math.round(totalScore / submissions.length) : 0,
          lastSubmission: submissions[0]?.createdAt || null,
        };
      })
    );

    res.status(200).json({ success: true, studentProgress });
  } catch (error) {
    console.error("Error fetching student progress:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
