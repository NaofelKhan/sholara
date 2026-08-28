const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const DepartmentResource = require("./models/DepartmentResource");

const seedCentralResources = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB for seeding Department Resources...");

    const users = await User.find();
    if (users.length === 0) {
      console.log("No users found to seed department resources.");
      process.exit(1);
    }

    const uploader = users.find((u) => u.role === "teacher" || u.role === "faculty") || users[0];

    await DepartmentResource.deleteMany({});

    const demoResources = [
      {
        title: "CS Academic Course Registration & Overload Form 2026",
        description: "Official CS department form for course add/drop and credit overload requests.",
        department: "Computer Science & Engineering",
        category: "form",
        fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        fileType: "pdf",
        uploadedBy: uploader._id,
      },
      {
        title: "CS Undergraduate Curriculum & Prerequisite Graph",
        description: "Complete course roadmap and required core/elective credits for Computer Science degree.",
        department: "Computer Science & Engineering",
        category: "syllabus",
        fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        fileType: "pdf",
        uploadedBy: uploader._id,
      },
      {
        title: "Senior Capstone Design Project Handbook & Grading Rubric",
        description: "Guidelines for CS thesis/project proposal submission, progress reports, and final presentation.",
        department: "Computer Science & Engineering",
        category: "lab_guide",
        fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        fileType: "pdf",
        uploadedBy: uploader._id,
      },
      {
        title: "EEE Circuit Simulator Software & Installation Guide",
        description: "SPICE and Multisim student license download link and setup instructions for EEE students.",
        department: "Electrical & Electronic Engineering",
        category: "tool",
        fileUrl: "https://www.ni.com/en-us/support/downloads/software-products/download.multisim.html",
        fileType: "link",
        uploadedBy: uploader._id,
      },
      {
        title: "Hardware Laboratory Safety & Equipment Operating Policy",
        description: "Mandatory EEE lab safety rules, high-voltage equipment usage guidelines, and emergency protocols.",
        department: "Electrical & Electronic Engineering",
        category: "policy",
        fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        fileType: "pdf",
        uploadedBy: uploader._id,
      },
      {
        title: "EEE Internship & Industrial Training Approval Form",
        description: "Academic credit evaluation form for EEE summer industry internships.",
        department: "Electrical & Electronic Engineering",
        category: "form",
        fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        fileType: "pdf",
        uploadedBy: uploader._id,
      },
    ];

    await DepartmentResource.create(demoResources);

    console.log("✅ Respective Department Resources Seeded Successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedCentralResources();
