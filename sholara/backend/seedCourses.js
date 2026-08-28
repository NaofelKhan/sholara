const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Course = require("./models/Course");
const CourseMaterial = require("./models/CourseMaterial");
const CourseAssignment = require("./models/CourseAssignment");
const CourseDiscussion = require("./models/CourseDiscussion");
const CourseAttendance = require("./models/CourseAttendance");
const CourseAnnouncement = require("./models/CourseAnnouncement");

const seedCourses = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB for seeding demo courses...");

    // Find or create demo instructor and student users
    let instructor = await User.findOne({ role: "teacher" });
    if (!instructor) {
      instructor = await User.findOne({});
    }

    if (!instructor) {
      console.log("No user found. Creating demo instructor...");
      instructor = await User.create({
        fullName: "Dr. Alan Turing",
        email: "turing@scholara.edu",
        password: "password123",
        role: "teacher",
        department: "Computer Science",
        university: "Scholara University",
      });
    }

    let student = await User.findOne({ _id: { $ne: instructor._id } });
    if (!student) {
      student = await User.create({
        fullName: "Alex Rivera",
        email: "alex@scholara.edu",
        password: "password123",
        role: "student",
        department: "Computer Science",
        studentId: "CS-2026-042",
        university: "Scholara University",
      });
    }

    console.log(`Using Instructor: ${instructor.fullName} (${instructor._id})`);
    console.log(`Using Student: ${student.fullName} (${student._id})`);

    // --- 1. CREATE CS COURSE ---
    console.log("Creating CS Course: Data Structures & Algorithms...");
    await Course.deleteMany({ code: "CSE-201" });

    const csCourse = await Course.create({
      title: "Data Structures & Algorithms",
      code: "CSE-201",
      description: "Fundamental concepts of data structures including linked lists, binary trees, graphs, sorting algorithms, and complexity analysis.",
      department: "Computer Science & Engineering",
      semester: "Fall 2026",
      instructor: instructor._id,
      joinCode: "CS-CSE201",
      enrolledStudents: [student._id],
      coverGradient: "from-[#002045] to-[#1a365d]",
    });

    // Announcements for CS Course
    await CourseAnnouncement.deleteMany({ course: csCourse._id });
    await CourseAnnouncement.create([
      {
        course: csCourse._id,
        title: "Midterm Exam Coverage & Practice Problem Set",
        content: "The upcoming Midterm Examination will cover Arrays, Linked Lists, BSTs, and Graph Traversal. Please review Assignment 1 solution notes before Monday's lecture.",
        isPinned: true,
        author: instructor._id,
      },
      {
        course: csCourse._id,
        title: "Office Hours Rescheduled for Thursday",
        content: "Due to the Faculty Research Symposium, Office Hours this week are moved to Thursday 3:00 PM - 5:00 PM in Lab 304.",
        isPinned: false,
        author: instructor._id,
      },
    ]);

    // Materials for CS Course
    await CourseMaterial.deleteMany({ course: csCourse._id });
    await CourseMaterial.create([
      {
        course: csCourse._id,
        title: "Lecture 1: Arrays & Singly Linked Lists",
        description: "Introduction to contiguous memory allocation and node pointers.",
        fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        fileType: "pdf",
        uploadedBy: instructor._id,
      },
      {
        course: csCourse._id,
        title: "Binary Search Trees & Heap Implementation",
        description: "Comprehensive notes on balanced trees and priority queues.",
        fileUrl: "https://www.geeksforgeeks.org/binary-search-tree-data-structure/",
        fileType: "link",
        uploadedBy: instructor._id,
      },
      {
        course: csCourse._id,
        title: "Graph Traversal Algorithms (BFS & DFS)",
        description: "Adjacency list representation, depth-first, and breadth-first search recursion.",
        fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        fileType: "pdf",
        uploadedBy: instructor._id,
      },
    ]);

    // Assignments for CS Course
    await CourseAssignment.deleteMany({ course: csCourse._id });
    await CourseAssignment.create([
      {
        course: csCourse._id,
        title: "Assignment 1: Linked List Operations",
        description: "Implement doubly linked list with insertion, deletion, and reverse methods in Java or C++.",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxPoints: 100,
        createdBy: instructor._id,
        submissions: [
          {
            student: student._id,
            textContent: "Completed doubly linked list with edge case unit tests.",
            fileUrl: "https://github.com/demo/linked-list-hw",
            submittedAt: new Date(),
            grade: 95,
            feedback: "Excellent pointer management and memory safety!",
          },
        ],
      },
      {
        course: csCourse._id,
        title: "Assignment 2: Graph Shortest Path (Dijkstra)",
        description: "Implement Dijkstra's shortest path algorithm using a min-heap priority queue.",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        maxPoints: 100,
        createdBy: instructor._id,
        submissions: [],
      },
    ]);

    // Discussions for CS Course
    await CourseDiscussion.deleteMany({ course: csCourse._id });
    await CourseDiscussion.create([
      {
        course: csCourse._id,
        title: "Time Complexity of QuickSort vs MergeSort",
        content: "Why does QuickSort often perform faster than MergeSort in practice despite having a worst-case O(n^2)?",
        author: student._id,
        replies: [
          {
            author: instructor._id,
            content: "Great question! QuickSort has better cache locality and operates in-place without auxiliary array allocation overhead.",
            createdAt: new Date(),
          },
        ],
      },
    ]);

    // Attendance for CS Course
    await CourseAttendance.deleteMany({ course: csCourse._id });
    await CourseAttendance.create([
      {
        course: csCourse._id,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        topic: "Pointers & Memory Layout",
        createdBy: instructor._id,
        records: [{ student: student._id, status: "present" }],
      },
      {
        course: csCourse._id,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        topic: "Asymptotic Notation O(n)",
        createdBy: instructor._id,
        records: [{ student: student._id, status: "present" }],
      },
    ]);

    console.log("✅ CS Course Created Successfully!");

    // --- 2. CREATE EEE COURSE ---
    console.log("Creating EEE Course: Electrical Circuits & Systems...");
    await Course.deleteMany({ code: "EEE-101" });

    const eeeCourse = await Course.create({
      title: "Electrical Circuits & Systems",
      code: "EEE-101",
      description: "Analysis of DC and AC circuits, Kirchhoff's laws, Mesh and Nodal analysis, Thevenin and Norton equivalent theorems, and transient response.",
      department: "Electrical & Electronic Engineering",
      semester: "Fall 2026",
      instructor: instructor._id,
      joinCode: "EEE-EEE101",
      enrolledStudents: [student._id],
      coverGradient: "from-[#003730] to-[#006b5f]",
    });

    // Announcements for EEE Course
    await CourseAnnouncement.deleteMany({ course: eeeCourse._id });
    await CourseAnnouncement.create([
      {
        course: eeeCourse._id,
        title: "Lab Safety Gear Requirement for Circuit Hardware Sessions",
        content: "All students must bring safety goggles and breadboard wire kits for Lab Session 2 starting next Tuesday.",
        isPinned: true,
        author: instructor._id,
      },
    ]);

    // Materials for EEE Course
    await CourseMaterial.deleteMany({ course: eeeCourse._id });
    await CourseMaterial.create([
      {
        course: eeeCourse._id,
        title: "Kirchhoff's Current & Voltage Laws Guide",
        description: "Fundamental circuit principles and node equation setups.",
        fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        fileType: "pdf",
        uploadedBy: instructor._id,
      },
      {
        course: eeeCourse._id,
        title: "AC Phasors & Impedance Calculation",
        description: "Complex numbers, RLC components, and sinusoidal steady-state analysis.",
        fileUrl: "https://www.electronics-tutorials.ws/accircuits/phasors.html",
        fileType: "link",
        uploadedBy: instructor._id,
      },
      {
        course: eeeCourse._id,
        title: "Oscilloscope & Function Generator Lab Manual",
        description: "Step-by-step instructions for electronic instrumentation lab.",
        fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        fileType: "pdf",
        uploadedBy: instructor._id,
      },
    ]);

    // Assignments for EEE Course
    await CourseAssignment.deleteMany({ course: eeeCourse._id });
    await CourseAssignment.create([
      {
        course: eeeCourse._id,
        title: "Lab Report 1: Verification of Kirchhoff's Laws",
        description: "Submit measured voltage and current data from breadboard setup and calculate percentage error.",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        maxPoints: 50,
        createdBy: instructor._id,
        submissions: [
          {
            student: student._id,
            textContent: "Verified KVL in loop 1 & KCL at Node A. Measured error was under 1.2%.",
            fileUrl: "https://drive.google.com/demo/eee-lab1-report.pdf",
            submittedAt: new Date(),
            grade: 48,
            feedback: "Thorough data collection and clean error analysis!",
          },
        ],
      },
      {
        course: eeeCourse._id,
        title: "Problem Set 2: Thevenin Equivalent Circuits",
        description: "Solve 5 circuit network problems finding Rth and Vth at specified load terminals.",
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        maxPoints: 100,
        createdBy: instructor._id,
        submissions: [],
      },
    ]);

    // Discussions for EEE Course
    await CourseDiscussion.deleteMany({ course: eeeCourse._id });
    await CourseDiscussion.create([
      {
        course: eeeCourse._id,
        title: "Finding Dependent Source Equivalent Resistance",
        content: "When calculating Rth with dependent sources present, do we turn off dependent sources or deactivate independent sources only?",
        author: student._id,
        replies: [
          {
            author: instructor._id,
            content: "Turn off independent sources ONLY. Keep dependent sources active and apply a test voltage 1V at terminals!",
            createdAt: new Date(),
          },
        ],
      },
    ]);

    // Attendance for EEE Course
    await CourseAttendance.deleteMany({ course: eeeCourse._id });
    await CourseAttendance.create([
      {
        course: eeeCourse._id,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        topic: "Mesh Analysis & Matrix Solving",
        createdBy: instructor._id,
        records: [{ student: student._id, status: "present" }],
      },
      {
        course: eeeCourse._id,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        topic: "Introduction to RLC Passive Elements",
        createdBy: instructor._id,
        records: [{ student: student._id, status: "present" }],
      },
    ]);

    console.log("✅ EEE Course Created Successfully!");
    console.log("\n--- SEED COMPLETE ---");
    console.log(`Course 1: Data Structures & Algorithms [CSE-201] (Join Code: CS-CSE201)`);
    console.log(`Course 2: Electrical Circuits & Systems [EEE-101] (Join Code: EEE-EEE101)`);

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedCourses();
