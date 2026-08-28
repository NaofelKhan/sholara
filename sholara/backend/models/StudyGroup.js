const mongoose = require("mongoose");

const studyGroupSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    joinCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    maxMembers: {
      type: Number,
      default: 10,
    },
    meetingLocation: {
      type: String,
      default: "Online / Discord / Google Meet",
    },
    coverGradient: {
      type: String,
      default: "from-[#002045] to-[#003730]",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("StudyGroup", studyGroupSchema);
