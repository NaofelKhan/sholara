const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./config/db");
const User = require("./models/User");

const demoAccounts = [
  {
    fullName: "System Administrator",
    email: "admin@scholara.edu",
    password: "admin123456",
    role: "admin",
    university: "Scholara Academy",
    department: "System Operations",
    studentId: "ADM-2026-001",
  },
  {
    fullName: "Dr. Sarah Jenkins",
    email: "faculty@scholara.edu",
    password: "faculty123456",
    role: "faculty",
    university: "Scholara Academy",
    department: "Computer Science",
    studentId: "FAC-2026-101",
  },
  {
    fullName: "Alex Rivera",
    email: "ta@scholara.edu",
    password: "ta123456",
    role: "ta",
    university: "Scholara Academy",
    department: "Computer Science",
    studentId: "TA-2026-301",
  },
  {
    fullName: "Jane Doe",
    email: "student@scholara.edu",
    password: "student123456",
    role: "student",
    university: "Scholara Academy",
    department: "Computer Science",
    studentId: "STU-2026-501",
  },
];

const seedAccounts = async () => {
  try {
    await connectDB();

    for (const acc of demoAccounts) {
      let existingUser = await User.findOne({ email: acc.email });

      if (existingUser) {
        existingUser.fullName = acc.fullName;
        existingUser.role = acc.role;
        existingUser.university = acc.university;
        existingUser.department = acc.department;
        existingUser.studentId = acc.studentId;
        await existingUser.save();
        console.log(`✅ Updated existing user: ${acc.email} (${acc.role})`);
      } else {
        await User.create(acc);
        console.log(`✅ Created new account: ${acc.email} (${acc.role})`);
      }
    }

    console.log("\n========================================================");
    console.log("             SCHOLARA DEMO ACCOUNTS");
    console.log("========================================================");
    console.log(" 1. FACULTY ACCOUNT:");
    console.log("    Email:    faculty@scholara.edu");
    console.log("    Password: faculty123456");
    console.log("    Role:     faculty\n");
    console.log(" 2. TEACHING ASSISTANT (TA) ACCOUNT:");
    console.log("    Email:    ta@scholara.edu");
    console.log("    Password: ta123456");
    console.log("    Role:     ta\n");
    console.log(" 3. STUDENT ACCOUNT:");
    console.log("    Email:    student@scholara.edu");
    console.log("    Password: student123456");
    console.log("    Role:     student\n");
    console.log(" 4. ADMINISTRATOR ACCOUNT:");
    console.log("    Email:    admin@scholara.edu");
    console.log("    Password: admin123456");
    console.log("    Role:     admin");
    console.log("========================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Account Seeding Failed:", error.message);
    process.exit(1);
  }
};

seedAccounts();
