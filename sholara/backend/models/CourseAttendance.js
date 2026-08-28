const mongoose = require("mongoose");

const attendanceRecordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["present", "absent", "late"],
      default: "present",
    },
  },
  { _id: false }
);

const courseAttendanceSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    topic: {
      type: String,
      default: "Lecture Session",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    records: [attendanceRecordSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CourseAttendance", courseAttendanceSchema);
