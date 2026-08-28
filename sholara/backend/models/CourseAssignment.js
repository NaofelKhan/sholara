const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileUrl: {
      type: String,
      default: "",
    },
    textContent: {
      type: String,
      default: "",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    grade: {
      type: Number,
      default: null,
    },
    feedback: {
      type: String,
      default: "",
    },
  },
  { _id: true }
);

const courseAssignmentSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
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
    dueDate: {
      type: Date,
      required: true,
    },
    maxPoints: {
      type: Number,
      default: 100,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    submissions: [submissionSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CourseAssignment", courseAssignmentSchema);
