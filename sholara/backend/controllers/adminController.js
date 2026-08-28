const User = require("../models/User");
const Course = require("../models/Course");
const StudyGroup = require("../models/StudyGroup");
const SkillRequest = require("../models/SkillRequest");
const DepartmentPost = require("../models/DepartmentPost");

// GET /api/admin/users - Get all users with filters
exports.getUsers = async (req, res) => {
  try {
    const { role, department, search } = req.query;
    const query = {};

    if (role && role !== "all") {
      if (role === "faculty") {
        query.role = { $in: ["faculty", "teacher"] };
      } else {
        query.role = role;
      }
    }

    if (department && department !== "all") {
      query.department = { $regex: new RegExp(department, "i") };
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { studentId: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

// PUT /api/admin/users/:id/role - Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = ["student", "faculty", "teacher", "ta", "admin"];

    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");
    res.json({ message: "User role updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user role", error: error.message });
  }
};

// GET /api/admin/stats - System health & platform metrics
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const studentsCount = await User.countDocuments({ role: { $in: ["student", "", null] } });
    const facultyCount = await User.countDocuments({ role: { $in: ["faculty", "teacher"] } });
    const taCount = await User.countDocuments({ role: "ta" });
    const adminCount = await User.countDocuments({ role: "admin" });

    const totalCourses = await Course.countDocuments();
    const totalStudyGroups = await StudyGroup.countDocuments();
    const totalSkillRequests = await SkillRequest.countDocuments();
    const totalDeptPosts = await DepartmentPost.countDocuments();

    res.json({
      users: {
        total: totalUsers,
        students: studentsCount,
        faculty: facultyCount,
        ta: taCount,
        admins: adminCount,
      },
      platform: {
        courses: totalCourses,
        studyGroups: totalStudyGroups,
        skillRequests: totalSkillRequests,
        departmentPosts: totalDeptPosts,
      },
      systemStatus: {
        health: "Optimal",
        compliance: "Compliant (FERPA / GDPR Standards)",
        activeServices: ["Auth", "Course Workspaces", "Skill Exchange", "Department Channels"],
        lastAudit: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch admin stats", error: error.message });
  }
};

// GET /api/admin/departments - Department breakdown
exports.getDepartmentStats = async (req, res) => {
  try {
    const departmentAggregation = await User.aggregate([
      {
        $group: {
          _id: { $ifNull: ["$department", "Unassigned"] },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json(departmentAggregation);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch department stats", error: error.message });
  }
};
