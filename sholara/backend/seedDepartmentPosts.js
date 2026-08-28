const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const DepartmentPost = require("./models/DepartmentPost");

const seedDepartmentPosts = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB for seeding Department Posts...");

    const users = await User.find();
    if (users.length === 0) {
      console.log("No users found to seed department posts.");
      process.exit(1);
    }

    const facultyUser = users.find((u) => u.role === "teacher" || u.role === "faculty") || users[0];
    const studentUser = users.length > 1 ? users[1] : users[0];

    await DepartmentPost.deleteMany({});

    const demoPosts = [
      {
        title: "Fall 2026 Midterm Examination Schedule & Advisory",
        content: "The official midterm examination schedule for Fall 2026 is now available. Exams will commence from October 12th. Please review your course codes and room allocations. Strict adherence to academic integrity guidelines is required.",
        department: "Computer Science & Engineering",
        category: "notice",
        isPinned: true,
        fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        author: facultyUser._id,
        comments: [
          {
            author: studentUser._id,
            content: "Will lab exams take place before or after the theory written exams?",
            createdAt: new Date(),
          },
          {
            author: facultyUser._id,
            content: "Lab exams are scheduled for the week prior to theory exams.",
            createdAt: new Date(),
          },
        ],
      },
      {
        title: "Research Assistant Opportunity: AI & Machine Learning Lab",
        content: "The Department of Computer Science invites applications for undergraduate Research Assistants in Computer Vision and NLP. Qualified candidates with background in Python and PyTorch can apply before September 15th.",
        department: "Computer Science & Engineering",
        category: "opportunity",
        isPinned: false,
        fileUrl: "https://drive.google.com/demo/ml-lab-ra-call.pdf",
        author: facultyUser._id,
        comments: [],
      },
      {
        title: "New High-Performance GPU Server Cluster Installed in Lab 402",
        content: "We are pleased to announce the installation of 8 NVIDIA RTX 4090 GPUs in Lab 402 for deep learning course projects and senior thesis research. Students can request access credentials through their faculty advisors.",
        department: "Computer Science & Engineering",
        category: "update",
        isPinned: false,
        fileUrl: "",
        author: facultyUser._id,
        comments: [],
      },
      {
        title: "EEE Department Annual Robotics & Circuit Design Competition",
        content: "Registrations are now open for the EEE Annual Circuit Hackathon and Autonomous Robotics Competition. Cash prizes up to $2,500 will be awarded to top 3 winning teams. Register your team of 3-4 members by October 1st.",
        department: "Electrical & Electronic Engineering",
        category: "opportunity",
        isPinned: true,
        fileUrl: "https://drive.google.com/demo/eee-robotics-hackathon.pdf",
        author: facultyUser._id,
        comments: [
          {
            author: studentUser._id,
            content: "Can students from CS department join an EEE team?",
            createdAt: new Date(),
          },
        ],
      },
      {
        title: "Notice: High-Voltage Hardware Lab Hours Extended",
        content: "To support senior design projects, Hardware Lab 304 will remain open until 9:00 PM on weekdays. Teaching assistants will be present to supervise equipment usage.",
        department: "Electrical & Electronic Engineering",
        category: "notice",
        isPinned: false,
        fileUrl: "",
        author: facultyUser._id,
        comments: [],
      },
    ];

    await DepartmentPost.create(demoPosts);

    console.log("✅ Department Channel Posts Seeded Successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedDepartmentPosts();
