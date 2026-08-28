const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./config/db");
const User = require("./models/User");

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = "admin@scholara.edu";
    let adminUser = await User.findOne({ email: adminEmail });

    if (adminUser) {
      adminUser.role = "admin";
      adminUser.fullName = "System Administrator";
      adminUser.department = "System Operations";
      adminUser.university = "Scholara Academy";
      adminUser.studentId = "ADM-2026-001";
      await adminUser.save();
      console.log("✅ Existing Admin user updated with Admin role!");
    } else {
      adminUser = await User.create({
        fullName: "System Administrator",
        email: adminEmail,
        password: "admin123456",
        role: "admin",
        university: "Scholara Academy",
        department: "System Operations",
        studentId: "ADM-2026-001",
      });
      console.log("✅ Admin user created successfully!");
    }

    console.log("\n=========================================");
    console.log("   SCHOLARA ADMIN CREDENTIALS");
    console.log("=========================================");
    console.log(` Email:    ${adminEmail}`);
    console.log(` Password: admin123456`);
    console.log(` Role:     admin`);
    console.log("=========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Admin Seeding Failed:", error.message);
    process.exit(1);
  }
};

seedAdmin();
