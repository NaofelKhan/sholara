const Course = require("../models/Course");
const CourseMaterial = require("../models/CourseMaterial");
const CourseAssignment = require("../models/CourseAssignment");
const CourseDiscussion = require("../models/CourseDiscussion");
const CourseAttendance = require("../models/CourseAttendance");
const User = require("../models/User");

// Generate unique join code
const generateJoinCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "SCH-";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// GET /api/courses - Get all courses user is involved in (taught or enrolled)
exports.getCourses = async (req, res) => {
  try {
    const userId = req.user._id;
    const courses = await Course.find({
      $or: [{ instructor: userId }, { enrolledStudents: userId }],
    })
      .populate("instructor", "fullName email profilePicture department")
      .populate("enrolledStudents", "fullName email profilePicture")
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch courses", error: error.message });
  }
};

// POST /api/courses - Create a new course
exports.createCourse = async (req, res) => {
  try {
    const { title, code, description, department, semester, coverGradient } = req.body;

    if (!title || !code) {
      return res.status(400).json({ message: "Title and Course Code are required" });
    }

    let joinCode = generateJoinCode();
    // Ensure uniqueness
    let existing = await Course.findOne({ joinCode });
    while (existing) {
      joinCode = generateJoinCode();
      existing = await Course.findOne({ joinCode });
    }

    const course = await Course.create({
      title,
      code,
      description,
      department: department || req.user.department || "",
      semester: semester || "Fall 2026",
      instructor: req.user._id,
      joinCode,
      coverGradient: coverGradient || "from-[#002045] to-[#1a365d]",
    });

    const populatedCourse = await Course.findById(course._id).populate(
      "instructor",
      "fullName email profilePicture department"
    );

    res.status(201).json(populatedCourse);
  } catch (error) {
    res.status(500).json({ message: "Failed to create course", error: error.message });
  }
};

// POST /api/courses/join - Join course with code
exports.joinCourse = async (req, res) => {
  try {
    const { joinCode } = req.body;
    if (!joinCode) {
      return res.status(400).json({ message: "Join code is required" });
    }

    const course = await Course.findOne({ joinCode: joinCode.trim().toUpperCase() });
    if (!course) {
      return res.status(404).json({ message: "Course not found. Please verify the join code." });
    }

    // Check if user is instructor
    if (course.instructor.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You are the instructor of this course." });
    }

    // Check if already enrolled
    if (course.enrolledStudents.includes(req.user._id)) {
      return res.status(400).json({ message: "You are already enrolled in this course." });
    }

    course.enrolledStudents.push(req.user._id);
    await course.save();

    const populatedCourse = await Course.findById(course._id)
      .populate("instructor", "fullName email profilePicture department")
      .populate("enrolledStudents", "fullName email profilePicture");

    res.json(populatedCourse);
  } catch (error) {
    res.status(500).json({ message: "Failed to join course", error: error.message });
  }
};

// GET /api/courses/:id - Get single course details
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "fullName email profilePicture department role")
      .populate("enrolledStudents", "fullName email profilePicture studentId department role");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch course", error: error.message });
  }
};

// DELETE /api/courses/:id - Delete a course
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this course" });
    }

    await Course.findByIdAndDelete(req.params.id);
    await CourseMaterial.deleteMany({ course: req.params.id });
    await CourseAssignment.deleteMany({ course: req.params.id });
    await CourseDiscussion.deleteMany({ course: req.params.id });
    await CourseAttendance.deleteMany({ course: req.params.id });

    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete course", error: error.message });
  }
};

// DELETE /api/courses/:id/members/:studentId - Remove member from course
exports.removeMember = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const isInstructor = course.instructor.toString() === req.user._id.toString();
    const isSelf = req.params.studentId === req.user._id.toString();

    if (!isInstructor && !isSelf) {
      return res.status(403).json({ message: "Not authorized to remove member" });
    }

    course.enrolledStudents = course.enrolledStudents.filter(
      (id) => id.toString() !== req.params.studentId
    );
    await course.save();

    res.json({ message: "Member removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove member", error: error.message });
  }
};

// --- LEARNING MATERIALS ---

// GET /api/courses/:id/materials
exports.getMaterials = async (req, res) => {
  try {
    const materials = await CourseMaterial.find({ course: req.params.id })
      .populate("uploadedBy", "fullName profilePicture")
      .sort({ createdAt: -1 });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch materials", error: error.message });
  }
};

// POST /api/courses/:id/materials
exports.createMaterial = async (req, res) => {
  try {
    const { title, description, fileUrl, fileType } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const material = await CourseMaterial.create({
      course: req.params.id,
      title,
      description: description || "",
      fileUrl: fileUrl || "",
      fileType: fileType || "link",
      uploadedBy: req.user._id,
    });

    const populated = await CourseMaterial.findById(material._id).populate(
      "uploadedBy",
      "fullName profilePicture"
    );

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Failed to add material", error: error.message });
  }
};

// DELETE /api/courses/:id/materials/:materialId
exports.deleteMaterial = async (req, res) => {
  try {
    await CourseMaterial.findByIdAndDelete(req.params.materialId);
    res.json({ message: "Material deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete material", error: error.message });
  }
};

// --- ASSIGNMENTS ---

// GET /api/courses/:id/assignments
exports.getAssignments = async (req, res) => {
  try {
    const assignments = await CourseAssignment.find({ course: req.params.id })
      .populate("createdBy", "fullName profilePicture")
      .populate("submissions.student", "fullName email studentId profilePicture")
      .sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch assignments", error: error.message });
  }
};

// POST /api/courses/:id/assignments
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, maxPoints } = req.body;
    if (!title || !dueDate) {
      return res.status(400).json({ message: "Title and Due Date are required" });
    }

    const assignment = await CourseAssignment.create({
      course: req.params.id,
      title,
      description: description || "",
      dueDate,
      maxPoints: maxPoints || 100,
      createdBy: req.user._id,
    });

    const populated = await CourseAssignment.findById(assignment._id).populate(
      "createdBy",
      "fullName profilePicture"
    );

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Failed to create assignment", error: error.message });
  }
};

// POST /api/courses/:id/assignments/:assignmentId/submit
exports.submitAssignment = async (req, res) => {
  try {
    const { fileUrl, textContent } = req.body;
    const assignment = await CourseAssignment.findById(req.params.assignmentId);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Check if already submitted
    const existingIndex = assignment.submissions.findIndex(
      (sub) => sub.student.toString() === req.user._id.toString()
    );

    if (existingIndex >= 0) {
      assignment.submissions[existingIndex].fileUrl = fileUrl || assignment.submissions[existingIndex].fileUrl;
      assignment.submissions[existingIndex].textContent = textContent || assignment.submissions[existingIndex].textContent;
      assignment.submissions[existingIndex].submittedAt = new Date();
    } else {
      assignment.submissions.push({
        student: req.user._id,
        fileUrl: fileUrl || "",
        textContent: textContent || "",
        submittedAt: new Date(),
      });
    }

    await assignment.save();

    const updated = await CourseAssignment.findById(assignment._id)
      .populate("createdBy", "fullName profilePicture")
      .populate("submissions.student", "fullName email studentId profilePicture");

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to submit assignment", error: error.message });
  }
};

// PUT /api/courses/:id/assignments/:assignmentId/grade
exports.gradeSubmission = async (req, res) => {
  try {
    const { studentId, grade, feedback } = req.body;
    const assignment = await CourseAssignment.findById(req.params.assignmentId);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const submission = assignment.submissions.find(
      (sub) => sub.student.toString() === studentId
    );

    if (!submission) {
      return res.status(404).json({ message: "Student submission not found" });
    }

    submission.grade = grade;
    submission.feedback = feedback || "";

    await assignment.save();

    const updated = await CourseAssignment.findById(assignment._id)
      .populate("createdBy", "fullName profilePicture")
      .populate("submissions.student", "fullName email studentId profilePicture");

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to grade submission", error: error.message });
  }
};

// --- DISCUSSIONS ---

// GET /api/courses/:id/discussions
exports.getDiscussions = async (req, res) => {
  try {
    const discussions = await CourseDiscussion.find({ course: req.params.id })
      .populate("author", "fullName profilePicture role")
      .populate("replies.author", "fullName profilePicture role")
      .sort({ createdAt: -1 });
    res.json(discussions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch discussions", error: error.message });
  }
};

// POST /api/courses/:id/discussions
exports.createDiscussion = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "Title and Content are required" });
    }

    const discussion = await CourseDiscussion.create({
      course: req.params.id,
      title,
      content,
      author: req.user._id,
    });

    const populated = await CourseDiscussion.findById(discussion._id).populate(
      "author",
      "fullName profilePicture role"
    );

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Failed to create discussion", error: error.message });
  }
};

// POST /api/courses/:id/discussions/:discussionId/reply
exports.addReply = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: "Reply content is required" });
    }

    const discussion = await CourseDiscussion.findById(req.params.discussionId);
    if (!discussion) {
      return res.status(404).json({ message: "Discussion topic not found" });
    }

    discussion.replies.push({
      author: req.user._id,
      content,
      createdAt: new Date(),
    });

    await discussion.save();

    const updated = await CourseDiscussion.findById(discussion._id)
      .populate("author", "fullName profilePicture role")
      .populate("replies.author", "fullName profilePicture role");

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to post reply", error: error.message });
  }
};

// --- ATTENDANCE ---

// GET /api/courses/:id/attendance
exports.getAttendance = async (req, res) => {
  try {
    const sessions = await CourseAttendance.find({ course: req.params.id })
      .populate("createdBy", "fullName")
      .populate("records.student", "fullName email studentId profilePicture")
      .sort({ date: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch attendance records", error: error.message });
  }
};

// POST /api/courses/:id/attendance
exports.markAttendance = async (req, res) => {
  try {
    const { date, topic, records } = req.body;
    if (!records || !Array.isArray(records)) {
      return res.status(400).json({ message: "Records array is required" });
    }

    const session = await CourseAttendance.create({
      course: req.params.id,
      date: date || new Date(),
      topic: topic || "Lecture Session",
      createdBy: req.user._id,
      records,
    });

    const populated = await CourseAttendance.findById(session._id)
      .populate("createdBy", "fullName")
      .populate("records.student", "fullName email studentId profilePicture");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Failed to mark attendance", error: error.message });
  }
};

// --- GRADES SUMMARY ---

// GET /api/courses/:id/grades
exports.getGrades = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      "enrolledStudents",
      "fullName email studentId profilePicture"
    );
    const assignments = await CourseAssignment.find({ course: req.params.id }).populate(
      "submissions.student",
      "_id fullName"
    );

    // Build gradebook data
    const isInstructor = course.instructor.toString() === req.user._id.toString();

    // Students to show
    let studentList = course.enrolledStudents;
    if (!isInstructor) {
      // Students only see their own grade
      studentList = studentList.filter((s) => s._id.toString() === req.user._id.toString());
    }

    const gradebook = studentList.map((student) => {
      let totalEarned = 0;
      let totalMax = 0;
      const assignmentScores = assignments.map((assignment) => {
        const sub = assignment.submissions.find(
          (s) => s.student && s.student._id.toString() === student._id.toString()
        );
        const points = sub && sub.grade !== null && sub.grade !== undefined ? sub.grade : null;
        if (points !== null) {
          totalEarned += points;
          totalMax += assignment.maxPoints;
        }
        return {
          assignmentId: assignment._id,
          assignmentTitle: assignment.title,
          maxPoints: assignment.maxPoints,
          grade: points,
          feedback: sub ? sub.feedback : "",
          submittedAt: sub ? sub.submittedAt : null,
        };
      });

      const percentage = totalMax > 0 ? ((totalEarned / totalMax) * 100).toFixed(1) : "N/A";

      return {
        student,
        scores: assignmentScores,
        totalEarned,
        totalMax,
        percentage,
      };
    });

    res.json({
      assignments: assignments.map((a) => ({ id: a._id, title: a.title, maxPoints: a.maxPoints })),
      gradebook,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch grades", error: error.message });
  }
};
