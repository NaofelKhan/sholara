const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    issuer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
      index: true,
    },
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MarketplaceSkill",
      default: null,
    },
    skillTitle: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: "Skill Exchange",
    },
    hoursCompleted: {
      type: Number,
      default: 1,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["issued", "revoked"],
      default: "issued",
    },
    verificationCode: {
      type: String,
      required: true,
      unique: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

certificateSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model("Certificate", certificateSchema);
