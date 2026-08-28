const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  getUsers,
  updateUserRole,
  getAdminStats,
  getDepartmentStats,
} = require("../controllers/adminController");

router.use(protect);
router.use(adminOnly);

router.get("/users", getUsers);
router.put("/users/:id/role", updateUserRole);
router.get("/stats", getAdminStats);
router.get("/departments", getDepartmentStats);

module.exports = router;
