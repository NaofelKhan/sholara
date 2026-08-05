const SkillRequest = require("../models/SkillRequest");

// @desc    Get all skill requests
// @route   GET /api/skill-requests
// @access  Public
const getAllSkillRequests = async (req, res) => {
  try {
const skillRequests = await SkillRequest.find()
  .populate("userId", "fullName")
  .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: skillRequests.length,
      data: skillRequests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching skill requests",
      error: error.message,
    });
  }
};

// @desc    Get single skill request
// @route   GET /api/skill-requests/:id
// @access  Public
const getSkillRequestById = async (req, res) => {
  try {
    const skillRequest = await SkillRequest.findById(req.params.id);

    if (!skillRequest) {
      return res.status(404).json({
        success: false,
        message: "Skill request not found",
      });
    }

    res.status(200).json({
      success: true,
      data: skillRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching skill request",
      error: error.message,
    });
  }
};

// @desc    Create a new skill request
// @route   POST /api/skill-requests
// @access  Private
const createSkillRequest = async (req, res) => {
  try {
    const {
      skillTitle,
      learningObjectives,
      skillCategory,
      difficultyLevel,
      availability,
      scheduleNotes,
      estimatedBudget,
      frequency,
      estimatedDuration,
    } = req.body;

    const skillRequest = await SkillRequest.create({
      skillTitle,
      learningObjectives,
      skillCategory,
      difficultyLevel,
      availability,
      scheduleNotes,
      estimatedBudget,
      frequency,
      estimatedDuration,
      status: "posted",
      userId: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Skill request created successfully",
      data: skillRequest,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);

      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating skill request",
      error: error.message,
    });
  }
};

// @desc    Update a skill request
// @route   PUT /api/skill-requests/:id
// @access  Private
const updateSkillRequest = async (req, res) => {
  try {
    const skillRequest = await SkillRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!skillRequest) {
      return res.status(404).json({
        success: false,
        message: "Skill request not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Skill request updated successfully",
      data: skillRequest,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);

      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating skill request",
      error: error.message,
    });
  }
};

// @desc    Delete a skill request
// @route   DELETE /api/skill-requests/:id
// @access  Private
const deleteSkillRequest = async (req, res) => {
  try {
    const skillRequest = await SkillRequest.findByIdAndDelete(req.params.id);

    if (!skillRequest) {
      return res.status(404).json({
        success: false,
        message: "Skill request not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Skill request deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while deleting skill request",
      error: error.message,
    });
  }
};

// @desc    Save skill request as draft
// @route   POST /api/skill-requests/draft
// @access  Private
const saveAsDraft = async (req, res) => {
  try {
    const skillRequest = await SkillRequest.create({
      ...req.body,
      status: "draft",
      userId: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Skill request saved as draft",
      data: skillRequest,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);

      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while saving draft",
      error: error.message,
    });
  }
};

module.exports = {
  getAllSkillRequests,
  getSkillRequestById,
  createSkillRequest,
  updateSkillRequest,
  deleteSkillRequest,
  saveAsDraft,
};