const mongoose = require("mongoose");

const marketplaceSkillSchema = new mongoose.Schema(
  {
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    coverImage: {
      type: String,
      default: "",
    },

    mentorTitle: {
    type: String,
    default: "Design Systems Manager",
    trim: true,
    },

    mentorRole: {
    type: String,
    enum: ["Mentor", "Junior", "Senior", "Expert"],
    default: "Senior",
    },

    category: {
      type: String,
      required: true,
    },

    source: {
      type: String,
      enum: ["marketplace", "skill-request"],
      default: "marketplace",
    },

    difficultyLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Advanced",
    },

    pricingModel: {
      type: String,
      enum: ["Free", "Paid Service"],
      default: "Free",
    },

    price: {
      type: Number,
      default: 0,
    },

    frequency: {
      type: String,
      default: "Per Hour",
    },

    estimatedDuration: {
      type: Number,
      default: 60,
    },

    deliveryMethod: {
      type: String,
      default: "Online (Video Call)",
    },

    availabilityDays: {
      type: [String],
      default: [],
    },

    availabilityNotes: {
      type: String,
      default: "",
    },

    rating: {
      type: Number,
      default: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    bookings: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "MarketplaceSkill",
  marketplaceSkillSchema
);