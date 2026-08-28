const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const StudyGroup = require("./models/StudyGroup");
const StudyGroupResource = require("./models/StudyGroupResource");
const StudyGroupSession = require("./models/StudyGroupSession");
const StudyGroupMessage = require("./models/StudyGroupMessage");

const seedStudyGroups = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB for seeding Study Groups...");

    const users = await User.find();
    if (users.length === 0) {
      console.log("No users found to assign to study groups.");
      process.exit(1);
    }

    const creator = users[0];
    const member = users.length > 1 ? users[1] : users[0];

    // --- 1. CS STUDY GROUP ---
    console.log("Creating CS Study Group...");
    await StudyGroup.deleteMany({ title: "Algorithms & LeetCode Study Circle" });

    const csGroup = await StudyGroup.create({
      title: "Algorithms & LeetCode Study Circle",
      subject: "Computer Science",
      description: "Weekly problem solving group focusing on Dynamic Programming, Graph Traversal, and technical interview preparation.",
      creator: creator._id,
      joinCode: "GRP-CS01",
      members: [creator._id, member._id],
      maxMembers: 12,
      meetingLocation: "Library Room 2A & Google Meet",
      coverGradient: "from-[#002045] to-[#003730]",
    });

    // Messages
    await StudyGroupMessage.deleteMany({ group: csGroup._id });
    await StudyGroupMessage.create([
      {
        group: csGroup._id,
        sender: creator._id,
        message: "Welcome everyone! Let's solve 3 LeetCode Medium problems on Trees this week.",
      },
      {
        group: csGroup._id,
        sender: member._id,
        message: "Sounds great! Are we focusing on Recursive DFS or Iterative BFS approaches?",
      },
      {
        group: csGroup._id,
        sender: creator._id,
        message: "We'll cover both approaches and analyze their space complexities.",
      },
    ]);

    // Resources
    await StudyGroupResource.deleteMany({ group: csGroup._id });
    await StudyGroupResource.create([
      {
        group: csGroup._id,
        title: "Dynamic Programming Cheat Sheet",
        description: "Patterns for 1D/2D memoization and bottom-up DP table setups.",
        fileUrl: "https://www.geeksforgeeks.org/dynamic-programming/",
        fileType: "link",
        uploadedBy: creator._id,
      },
      {
        group: csGroup._id,
        title: "Graph Algorithms Summary PDF",
        description: "Dijkstra, Topological Sort, and Kruskal's MST algorithms.",
        fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        fileType: "pdf",
        uploadedBy: member._id,
      },
    ]);

    // Sessions
    await StudyGroupSession.deleteMany({ group: csGroup._id });
    await StudyGroupSession.create([
      {
        group: csGroup._id,
        title: "Tree Traversal & Binary Search Review",
        description: "Live problem solving and peer code review session.",
        scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        locationOrLink: "Library Room 2A",
        createdBy: creator._id,
        attendees: [creator._id, member._id],
      },
    ]);

    // --- 2. EEE STUDY GROUP ---
    console.log("Creating EEE Study Group...");
    await StudyGroup.deleteMany({ title: "Circuit Analysis & MATLAB Lab Group" });

    const eeeGroup = await StudyGroup.create({
      title: "Circuit Analysis & MATLAB Lab Group",
      subject: "Electrical Engineering",
      description: "Collaborative study group for AC phasor calculations, Laplace transforms, and Simulink lab exercises.",
      creator: member._id,
      joinCode: "GRP-EEE2",
      members: [creator._id, member._id],
      maxMembers: 8,
      meetingLocation: "EEE Hardware Lab 304",
      coverGradient: "from-[#003730] to-[#006b5f]",
    });

    // Messages
    await StudyGroupMessage.deleteMany({ group: eeeGroup._id });
    await StudyGroupMessage.create([
      {
        group: eeeGroup._id,
        sender: member._id,
        message: "Hey team, let's review the Thevenin equivalent circuit problem set before the Friday quiz.",
      },
      {
        group: eeeGroup._id,
        sender: creator._id,
        message: "I brought the multimeters and breadboards for tomorrow's lab rehearsal!",
      },
    ]);

    // Resources
    await StudyGroupResource.deleteMany({ group: eeeGroup._id });
    await StudyGroupResource.create([
      {
        group: eeeGroup._id,
        title: "MATLAB Simulink Circuit Modeling Notes",
        description: "Starter template for RLC transient analysis.",
        fileUrl: "https://www.mathworks.com/help/simulink/",
        fileType: "link",
        uploadedBy: member._id,
      },
    ]);

    // Sessions
    await StudyGroupSession.deleteMany({ group: eeeGroup._id });
    await StudyGroupSession.create([
      {
        group: eeeGroup._id,
        title: "AC Phasors & Impedance Problem Solving",
        description: "Group review for midterm circuit exam.",
        scheduledAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        locationOrLink: "EEE Hardware Lab 304",
        createdBy: member._id,
        attendees: [creator._id, member._id],
      },
    ]);

    console.log("✅ Study Groups Seeded Successfully!");
    console.log("1. Algorithms & LeetCode Study Circle [GRP-CS01]");
    console.log("2. Circuit Analysis & MATLAB Lab Group [GRP-EEE2]");

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedStudyGroups();
