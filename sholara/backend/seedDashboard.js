const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./config/db");
const User = require("./models/User");
const Course = require("./models/Course");
const CourseAssignment = require("./models/CourseAssignment");
const StudyGroup = require("./models/StudyGroup");
const Availability = require("./models/Availability");
const Appointment = require("./models/Appointment");
const Booking = require("./models/Booking");
const MarketplaceSkill = require("./models/MarketplaceSkill");
const Notification = require("./models/Notification");

const toDateStr = (d) => d.toISOString().split("T")[0];

const seedDashboard = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB for dashboard seeding...");

    const student = await User.findOne({ email: "student@scholara.edu" });
    const faculty = await User.findOne({
      $or: [
        { email: "faculty@scholara.edu" },
        { role: { $in: ["faculty", "teacher"] } },
      ],
    });
    const ta = await User.findOne({ email: "ta@scholara.edu" });

    if (!student || !faculty) {
      console.log("Demo student/faculty accounts missing. Run seed:accounts first.");
      process.exit(1);
    }

    const courses = await Course.find({});
    for (const course of courses) {
      await Course.updateOne(
        { _id: course._id },
        {
          $addToSet: {
            enrolledStudents: student._id,
            ...(ta ? { teachingAssistants: ta._id } : {}),
          },
        }
      );
    }
    console.log(`Enrolled ${student.email} in ${courses.length} course(s).`);

    const groups = await StudyGroup.find({});
    for (const group of groups) {
      await StudyGroup.updateOne(
        { _id: group._id },
        { $addToSet: { members: { $each: [student._id, faculty._id] } } }
      );
    }
    console.log(`Added demo users to ${groups.length} study group(s).`);

    if (courses.length > 0) {
      const existingQuiz = await CourseAssignment.findOne({
        title: "Quantum Mechanics Quiz",
      });
      if (!existingQuiz) {
        await CourseAssignment.create({
          course: courses[0]._id,
          title: "Quantum Mechanics Quiz",
          description: "Short in-class quiz covering this week's lecture notes.",
          dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000),
          maxPoints: 20,
          createdBy: faculty._id,
          submissions: [],
        });
        console.log("Created upcoming assignment: Quantum Mechanics Quiz");
      }
    }

    let skill = await MarketplaceSkill.findOne({
      mentor: { $ne: student._id },
      status: "published",
    });

    if (!skill) {
      skill = await MarketplaceSkill.create({
        mentor: faculty._id,
        title: "Public Speaking",
        description:
          "Practice presentation structure, pacing, and confident delivery for class talks.",
        mentorTitle: faculty.fullName,
        category: "Public Speaking",
        difficultyLevel: "Beginner",
        pricingModel: "Free",
        price: 0,
        deliveryMethod: "Online (Video Call)",
        status: "published",
      });
      console.log("Created marketplace skill: Public Speaking");
    }

    const hasBooking = await Booking.findOne({
      student: student._id,
      skill: skill._id,
      status: { $in: ["pending", "confirmed", "rescheduled"] },
    });

    if (!hasBooking) {
      await Booking.create({
        student: student._id,
        mentor: skill.mentor,
        skill: skill._id,
        scheduledAt: new Date(Date.now() + 26 * 60 * 60 * 1000),
        duration: 60,
        sessionType: "Online",
        meetingLink: "https://meet.google.com/scholara-demo",
        status: "confirmed",
        notes: "Dashboard calendar demo session",
      });
      console.log("Created confirmed skill session booking for student.");
    }

    const aptDate = toDateStr(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000));
    let slot = await Availability.findOne({
      faculty: faculty._id,
      date: aptDate,
      startTime: "13:00",
    });
    if (!slot) {
      slot = await Availability.create({
        faculty: faculty._id,
        date: aptDate,
        startTime: "13:00",
        endTime: "13:30",
        isBooked: true,
      });
    }

    const hasApt = await Appointment.findOne({
      student: student._id,
      faculty: faculty._id,
      date: aptDate,
      startTime: "13:00",
    });
    if (!hasApt) {
      await Appointment.create({
        student: student._id,
        faculty: faculty._id,
        slot: slot._id,
        date: aptDate,
        startTime: "13:00",
        endTime: "13:30",
        reason: "Office hours — project review",
        status: "scheduled",
      });
      console.log("Created faculty appointment for student.");
    }

    const studentNotifCount = await Notification.countDocuments({
      recipient: student._id,
    });
    if (studentNotifCount === 0) {
      await Notification.insertMany([
        {
          recipient: student._id,
          sender: faculty._id,
          type: "announcement",
          title: "New course announcement",
          message: `${faculty.fullName} posted a new announcement in your course workspace.`,
          link: "/courses",
        },
        {
          recipient: student._id,
          sender: skill.mentor,
          type: "skill_exchange",
          title: "Session confirmed",
          message: `Your skill exchange request for ${skill.title} was confirmed.`,
          link: "/my-sessions",
        },
        {
          recipient: student._id,
          sender: faculty._id,
          type: "grade",
          title: "Assignment graded",
          message: `${faculty.fullName} graded a recent submission in your course.`,
          link: "/courses",
        },
      ]);
      console.log("Seeded recent activity notifications for student.");
    }

    const facultyNotifCount = await Notification.countDocuments({
      recipient: faculty._id,
    });
    if (facultyNotifCount === 0) {
      await Notification.create({
        recipient: faculty._id,
        sender: student._id,
        type: "appointment",
        title: "New appointment scheduled",
        message: `${student.fullName} booked office hours for a project review.`,
        link: "/calendar",
      });
    }

    console.log("Dashboard seeding completed.");
    process.exit(0);
  } catch (error) {
    console.error("Dashboard seeding failed:", error);
    process.exit(1);
  }
};

seedDashboard();
