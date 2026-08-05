const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MarketplaceSkill",
      required: true,
    },

    scheduledAt: {
      type: Date,
      required: true,
    },

    duration: {
      type: Number,
      default: 60,
    },

    sessionType: {
      type: String,
      enum: ["Online", "In-Person"],
      required: true,
    },

    meetingLink: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "rescheduled", "cancelled", "completed"],
      default: "pending",
    },

    notes: {
      type: String,
      default: "",
    },

    cancellationReason: {
      type: String,
      default: "",
    },

    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    rescheduleHistory: [
      {
        previousDate: Date,
        newDate: Date,
        reason: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ student: 1, scheduledAt: -1 });
bookingSchema.index({ mentor: 1, scheduledAt: -1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model("Booking", bookingSchema);