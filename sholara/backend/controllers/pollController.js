const Poll = require("../models/Poll");
const Course = require("../models/Course");
const { notifyMultipleUsers } = require("../utils/notificationService");

// GET /api/courses/:id/polls - Get all polls for a course
exports.getCoursePolls = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user._id.toString();

    const polls = await Poll.find({ course: courseId })
      .populate("createdBy", "fullName profilePicture role")
      .populate("responses.student", "fullName profilePicture studentId")
      .sort({ createdAt: -1 });

    const course = await Course.findById(courseId);
    const isInstructor =
      course &&
      (course.instructor.toString() === userId ||
        course.teachingAssistants?.some((ta) => ta.toString() === userId) ||
        req.user.role === "admin" ||
        req.user.role === "faculty");

    // Format response so students don't see other students' identities if anonymous,
    // and include helper fields (hasResponded, myResponse)
    const formatted = polls.map((p) => {
      const pollObj = p.toObject();
      const userResponse = pollObj.responses.find(
        (r) => r.student && (r.student._id?.toString() === userId || r.student.toString() === userId)
      );

      const totalResponses = pollObj.responses.length;

      // Anonymize responses if poll is anonymous and viewer is not admin/instructor or if strict anonymity
      if (pollObj.isAnonymous) {
        pollObj.responses = pollObj.responses.map((r) => ({
          ...r,
          student: { fullName: "Anonymous Student", studentId: "HIDDEN" },
        }));
      }

      return {
        ...pollObj,
        hasResponded: !!userResponse,
        myResponse: userResponse || null,
        totalResponses,
        canManage: isInstructor,
      };
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch polls",
      error: error.message,
    });
  }
};

// POST /api/courses/:id/polls - Create a new poll/survey
exports.createPoll = async (req, res) => {
  try {
    const courseId = req.params.id;
    const { title, description, pollType, options, isAnonymous } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Poll title is required." });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    // Role check: Instructor, TA, Faculty, or Admin
    const isInstructor =
      course.instructor.toString() === req.user._id.toString() ||
      course.teachingAssistants?.some((ta) => ta.toString() === req.user._id.toString()) ||
      req.user.role === "faculty" ||
      req.user.role === "teacher" ||
      req.user.role === "ta" ||
      req.user.role === "admin";

    if (!isInstructor) {
      return res.status(403).json({
        message: "Only course instructors and faculty members can create polls.",
      });
    }

    let formattedOptions = [];
    if (pollType !== "text_feedback") {
      if (!options || !Array.isArray(options) || options.filter((o) => o && o.trim()).length < 2) {
        return res.status(400).json({
          message: "Choice polls must have at least 2 non-empty options.",
        });
      }
      formattedOptions = options
        .filter((o) => o && o.trim())
        .map((opt) => ({ text: opt.trim(), votes: [] }));
    }

    const poll = await Poll.create({
      course: courseId,
      title: title.trim(),
      description: description ? description.trim() : "",
      pollType: pollType || "single_choice",
      options: formattedOptions,
      isAnonymous: !!isAnonymous,
      isActive: true,
      createdBy: req.user._id,
    });

    const populated = await Poll.findById(poll._id).populate(
      "createdBy",
      "fullName profilePicture role"
    );

    // Notify enrolled students
    if (course.enrolledStudents?.length > 0) {
      try {
        await notifyMultipleUsers({
          recipients: course.enrolledStudents,
          sender: req.user._id,
          type: "announcement",
          title: `New Poll in ${course.code || course.title}`,
          message: `Faculty created a new poll: "${title.trim()}". Submit your response now.`,
          link: `/courses/${course._id}`,
          metadata: { courseId: course._id, pollId: poll._id },
        });
      } catch (e) {
        console.error("Poll notification error:", e);
      }
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create poll",
      error: error.message,
    });
  }
};

// POST /api/courses/:id/polls/:pollId/respond - Submit vote or response
exports.submitResponse = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { selectedOptions, textAnswer } = req.body;
    const userId = req.user._id;

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found." });
    }

    if (!poll.isActive) {
      return res.status(400).json({
        message: "This poll is currently closed for new responses.",
      });
    }

    // Check if already responded
    const existingIndex = poll.responses.findIndex(
      (r) => r.student.toString() === userId.toString()
    );

    if (poll.pollType === "text_feedback") {
      if (!textAnswer || !textAnswer.trim()) {
        return res.status(400).json({ message: "Please provide your feedback response." });
      }

      if (existingIndex >= 0) {
        poll.responses[existingIndex].textAnswer = textAnswer.trim();
        poll.responses[existingIndex].submittedAt = new Date();
      } else {
        poll.responses.push({
          student: userId,
          textAnswer: textAnswer.trim(),
          selectedOptions: [],
        });
      }
    } else {
      // Choice poll
      if (!selectedOptions || !Array.isArray(selectedOptions) || selectedOptions.length === 0) {
        return res.status(400).json({ message: "Please select at least one option." });
      }

      if (poll.pollType === "single_choice" && selectedOptions.length > 1) {
        return res.status(400).json({ message: "Only one option can be selected for single-choice polls." });
      }

      // Remove previous votes from options
      poll.options.forEach((opt) => {
        opt.votes = opt.votes.filter((v) => v.toString() !== userId.toString());
      });

      // Add vote to chosen options
      selectedOptions.forEach((idx) => {
        if (poll.options[idx]) {
          poll.options[idx].votes.push(userId);
        }
      });

      if (existingIndex >= 0) {
        poll.responses[existingIndex].selectedOptions = selectedOptions;
        poll.responses[existingIndex].submittedAt = new Date();
      } else {
        poll.responses.push({
          student: userId,
          selectedOptions,
          textAnswer: textAnswer || "",
        });
      }
    }

    await poll.save();

    const updated = await Poll.findById(poll._id)
      .populate("createdBy", "fullName profilePicture role")
      .populate("responses.student", "fullName profilePicture studentId");

    res.json({
      success: true,
      message: "Response submitted successfully!",
      poll: updated,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to submit poll response",
      error: error.message,
    });
  }
};

// PUT /api/courses/:id/polls/:pollId/toggle - Close / Reopen poll
exports.togglePollStatus = async (req, res) => {
  try {
    const { pollId } = req.params;
    const poll = await Poll.findById(pollId);

    if (!poll) {
      return res.status(404).json({ message: "Poll not found." });
    }

    poll.isActive = !poll.isActive;
    await poll.save();

    res.json({
      success: true,
      message: `Poll ${poll.isActive ? "re-opened" : "closed"} successfully.`,
      isActive: poll.isActive,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update poll status",
      error: error.message,
    });
  }
};

// DELETE /api/courses/:id/polls/:pollId - Delete poll
exports.deletePoll = async (req, res) => {
  try {
    const { pollId } = req.params;
    await Poll.findByIdAndDelete(pollId);
    res.json({ success: true, message: "Poll deleted successfully." });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete poll",
      error: error.message,
    });
  }
};
