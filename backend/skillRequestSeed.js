const mongoose = require("mongoose");
const dns = require("dns");

dns.setServers([
  "8.8.8.8",
  "1.1.1.1",
]);
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const SkillRequest = require("./models/SkillRequest");

dotenv.config();

const seedRequests = [
  {
    skillTitle: "React.js Fundamentals",
    learningObjectives:
      "Learn the fundamentals of React including components, JSX, props, state, hooks and routing.",
    skillCategory: "Programming",
    difficultyLevel: "Beginner",
    availability: ["Mon", "Wed", "Fri"],
    scheduleNotes: "Available after 6 PM on weekdays.",
    estimatedBudget: 2000,
    frequency: "Per Month",
    estimatedDuration: "4 Weeks",
    status: "posted",
    userId: new mongoose.Types.ObjectId("6a72303e2b02f65a9e112564"),
  },

  {
    skillTitle: "Conversational Mandarin",
    learningObjectives:
      "Improve speaking confidence, pronunciation and everyday conversations.",
    skillCategory: "Language",
    difficultyLevel: "Intermediate",
    availability: ["Tue", "Thu", "Sat"],
    scheduleNotes: "Weekend afternoons preferred.",
    estimatedBudget: 0,
    frequency: "Per Session",
    estimatedDuration: "8 Weeks",
    status: "posted",
    userId: new mongoose.Types.ObjectId("6a7230232b02f65a9e112562"),
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log("Connected to MongoDB.");

    // Remove only the old sample requests
    await SkillRequest.deleteMany({
      skillTitle: {
        $in: [
          "React.js Fundamentals",
          "Conversational Mandarin",
        ],
      },
    });

    await SkillRequest.insertMany(seedRequests);

    console.log("✅ Sample Skill Requests inserted successfully.");

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDatabase();