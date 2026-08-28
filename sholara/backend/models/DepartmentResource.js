const mongoose = require("mongoose");

const departmentResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    department: {
      type: String,
      required: true,
      default: "Computer Science & Engineering",
    },
    category: {
      type: String,
      enum: ["form", "lab_guide", "syllabus", "tool", "policy"],
      default: "form",
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ["pdf", "doc", "link", "zip"],
      default: "pdf",
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

module.exports = mongoose.model("DepartmentResource", departmentResourceSchema);
