const SkillRequest = require("../models/SkillRequest");
const MarketplaceSkill = require("../models/MarketplaceSkill");
const Booking = require("../models/Booking");

// @desc    Get all skill requests
// @route   GET /api/skill-requests
// @access  Public
const getAllSkillRequests = async (req, res) => {
  try {
    const skillRequests = await SkillRequest.find()
      .populate("userId", "fullName profilePicture department university")
      .populate("acceptedBy", "fullName profilePicture department university")
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
    const skillRequest = await SkillRequest.findById(req.params.id);

    if (!skillRequest) {
      return res.status(404).json({
        success: false,
        message: "Skill request not found.",
      });
    }

    // Only the user who posted the request can delete it
    if (skillRequest.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own skill requests.",
      });
    }

    await SkillRequest.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Skill request deleted successfully.",
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

const acceptSkillRequest = async (req, res) => {
  try {
    const skillRequest = await SkillRequest.findById(req.params.id);

    if (!skillRequest) {
      return res.status(404).json({
        success: false,
        message: "Skill request not found",
      });
    }

    // A student cannot accept their own request
    if (skillRequest.userId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot accept your own skill request.",
      });
    }

    // Only posted requests can be accepted
    if (skillRequest.status !== "posted") {
      return res.status(400).json({
        success: false,
        message: "This skill request is no longer available.",
      });
    }

    // Create a MarketplaceSkill for the person accepting the request.
    // The accepting user becomes the mentor.
    const marketplaceSkill = await MarketplaceSkill.create({
      mentor: req.user._id,
      title: skillRequest.skillTitle,
      description: skillRequest.learningObjectives,
      category: skillRequest.skillCategory,
      difficultyLevel: skillRequest.difficultyLevel,
      pricingModel: "Paid Service",
      price: skillRequest.estimatedBudget || 0,
      frequency: skillRequest.frequency,
      estimatedDuration: Number(skillRequest.estimatedDuration) || 60,
      availabilityDays: skillRequest.availability || [],
      deliveryMethod: "Online",
      source: "skill-request",
    });

    // Create the session.
    // Request owner = student
    // Person who accepted = mentor
    const booking = await Booking.create({
      student: skillRequest.userId,
      mentor: req.user._id,
      skill: marketplaceSkill._id,
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      duration: Number(skillRequest.estimatedDuration) || 60,
      sessionType: "Online",
      status: "pending",
      notes: skillRequest.learningObjectives || "",
    });

    // Mark request as matched
    skillRequest.status = "matched";
    skillRequest.acceptedBy = req.user._id;

    await skillRequest.save();

    const populatedRequest = await SkillRequest.findById(skillRequest._id)
      .populate(
        "userId",
        "fullName profilePicture department university"
      )
      .populate(
        "acceptedBy",
        "fullName profilePicture department university"
      );

    res.status(200).json({
      success: true,
      message: "Skill request accepted and session created successfully.",
      data: populatedRequest,
      bookingId: booking._id,
    });
  } catch (error) {
    console.error("Accept Skill Request Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while accepting skill request",
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
  acceptSkillRequest,
};