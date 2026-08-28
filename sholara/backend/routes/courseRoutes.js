const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getCourses,
  createCourse,
  joinCourse,
  getCourseById,
  deleteCourse,
  removeMember,
  getMaterials,
  createMaterial,
  deleteMaterial,
  getAssignments,
  createAssignment,
  submitAssignment,
  gradeSubmission,
  getDiscussions,
  createDiscussion,
  addReply,
  getAttendance,
  markAttendance,
  getGrades,
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  assignTA,
  removeTA,
} = require("../controllers/courseController");
const {
  getCoursePolls,
  createPoll,
  submitResponse,
  togglePollStatus,
  deletePoll,
} = require("../controllers/pollController");

// All routes require login authentication
router.use(protect);

// Courses
router.get("/", getCourses);
router.post("/", createCourse);
router.post("/join", joinCourse);
router.get("/:id", getCourseById);
router.delete("/:id", deleteCourse);
router.delete("/:id/members/:studentId", removeMember);

// Teaching Assistants
router.post("/:id/tas", assignTA);
router.delete("/:id/tas/:taId", removeTA);

// Course Announcement Board
router.get("/:id/announcements", getAnnouncements);
router.post("/:id/announcements", createAnnouncement);
router.delete("/:id/announcements/:announcementId", deleteAnnouncement);

// Polls & Surveys
router.get("/:id/polls", getCoursePolls);
router.post("/:id/polls", createPoll);
router.post("/:id/polls/:pollId/respond", submitResponse);
router.put("/:id/polls/:pollId/toggle", togglePollStatus);
router.delete("/:id/polls/:pollId", deletePoll);

// Materials
router.get("/:id/materials", getMaterials);
router.post("/:id/materials", createMaterial);
router.delete("/:id/materials/:materialId", deleteMaterial);

// Assignments
router.get("/:id/assignments", getAssignments);
router.post("/:id/assignments", createAssignment);
router.post("/:id/assignments/:assignmentId/submit", submitAssignment);
router.put("/:id/assignments/:assignmentId/grade", gradeSubmission);

// Discussions
router.get("/:id/discussions", getDiscussions);
router.post("/:id/discussions", createDiscussion);
router.post("/:id/discussions/:discussionId/reply", addReply);

// Attendance
router.get("/:id/attendance", getAttendance);
router.post("/:id/attendance", markAttendance);

// Grades
router.get("/:id/grades", getGrades);

module.exports = router;
