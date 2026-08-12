const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["Announcement", "Event", "Competition", "Opportunity"],
      required: true,
      default: "Announcement",
    },
    university: { type: String, default: "" },
    department: { type: String, default: "All Departments" },
    coverImage: { type: String, default: "" },
    eventDate: { type: Date, default: null },
    deadline: { type: Date, default: null },
    location: { type: String, default: "" },
    registrationLink: { type: String, default: "" },
    tags: { type: [String], default: [] },
    priority: {
      type: String,
      enum: ["normal", "important", "urgent"],
      default: "normal",
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

noticeSchema.index({ category: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("Notice", noticeSchema);