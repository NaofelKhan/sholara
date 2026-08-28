const mongoose = require("mongoose");

const studyGroupSessionSchema = new mongoose.Schema(
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
    scheduledAt: {
      type: Date,
      required: true,
    },
    locationOrLink: {
      type: String,
      default: "Library Study Room",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("StudyGroupSession", studyGroupSessionSchema);
