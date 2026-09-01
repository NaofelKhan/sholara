const connectDB = require("./config/db");
const User = require("./models/User");
require("dotenv").config();

const seedAcademicProfiles = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await connectDB();
    console.log("Connected to MongoDB");

    // Get all users first to see what we're working with
    const users = await User.find({});
    console.log(`Found ${users.length} users in database`);

    if (users.length === 0) {
      console.log("No users found in database. Nothing to seed.");
      process.exit(0);
    }

    const defaultAcademicData = {
      semester: "Fall 2024",
      gpa: 3.8,
      completion: 65,
      creditsCompleted: 92,
      totalCredits: 120,
      mentoringHours: 24,
      rank: "Top 5%",
      lecturesToday: 2,
      mentoringSessions: 1,
      focus: "Coursework",
    };

    console.log("Updating existing users with academic profile data...");
    
    let updatedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      // Check if user already has academic data
      const hasAcademicData = user.semester || user.gpa || user.completion;
      
      if (hasAcademicData) {
        console.log(`Skipping user ${user.email} - already has academic data`);
        skippedCount++;
        continue;
      }

      await User.findByIdAndUpdate(user._id, { $set: defaultAcademicData });
      console.log(`Updated user: ${user.email} (${user.fullName})`);
      updatedCount++;
    }

    console.log(`\n=== Seeding Summary ===`);
    console.log(`Total users found: ${users.length}`);
    console.log(`Users updated: ${updatedCount}`);
    console.log(`Users skipped (already had data): ${skippedCount}`);
    console.log("Seeding completed successfully!");
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding academic profiles:", error);
    process.exit(1);
  }
};

seedAcademicProfiles();
