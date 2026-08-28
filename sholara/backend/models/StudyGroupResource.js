const mongoose = require("mongoose");

const studyGroupResourceSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudyGroup",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    fileUrl: {
      type: String,
      default: "",
    },
    fileType: {
      type: String,
      enum: ["pdf", "doc", "link", "notes", "other"],
      default: "link",
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("StudyGroupResource", studyGroupResourceSchema);
