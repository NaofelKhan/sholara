const MarketplaceSkill = require("../models/MarketplaceSkill");
const cloudinary = require("../config/cloudinary");

// @desc    Create a new marketplace skill
// @route   POST /api/marketplace-skills
// @access  Private

const createMarketplaceSkill = async (req, res) => {
  try {
    let coverImage = "";

    // Upload cover image to Cloudinary
    if (req.file) {
      const file = `data:${req.file.mimetype};base64,${req.file.buffer.toString(
        "base64"
      )}`;

      const uploadResult = await cloudinary.uploader.upload(file, {
        folder: "scholara/marketplace-skills",
      });

      coverImage = uploadResult.secure_url;
    }

    const skill = await MarketplaceSkill.create({
      mentor: req.user._id,

        title: req.body.title,
        description: req.body.description,
        category: req.body.category,

        mentorTitle: req.body.mentorTitle,
        mentorRole: req.body.mentorRole,

      difficultyLevel: req.body.difficultyLevel,

      pricingModel: req.body.pricingModel,
      price: Number(req.body.price) || 0,
      frequency: req.body.frequency,

      estimatedDuration: Number(req.body.estimatedDuration) || 60,

      deliveryMethod: req.body.deliveryMethod,

      availabilityDays: Array.isArray(req.body.availabilityDays)
        ? req.body.availabilityDays
        : JSON.parse(req.body.availabilityDays || "[]"),

      availabilityNotes: req.body.availabilityNotes,

      coverImage,

      status: req.body.status || "published",
    });

    res.status(201).json({
      success: true,
      message: "Marketplace skill created successfully.",
      skill,
    });
  } catch (error) {
    console.error("Create Marketplace Skill Error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to create marketplace skill.",
    });
  }
};

// @desc    Get all published marketplace skills
// @route   GET /api/marketplace-skills
// @access  Public

const getMarketplaceSkills = async (req, res) => {
  try {
    const skills = await MarketplaceSkill.find({
      status: "published",
    })
      .populate(
        "mentor",
        "fullName profilePicture department university"
      )
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: skills.length,
      skills,
    });
  } catch (error) {
    console.error("Get Marketplace Skills Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createMarketplaceSkill,
  getMarketplaceSkills,
};