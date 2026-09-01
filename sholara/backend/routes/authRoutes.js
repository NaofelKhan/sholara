const express = require("express");

const router = express.Router();

const {
    registerUser,
    loginUser,
    getProfile,
    updateProfilePicture,
    updateAcademicProfile,
} = require("../controllers/authController");

const {
    protect,
} = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");


// Register
router.post("/register", registerUser);


// Login
router.post("/login", loginUser);


// Get logged-in user profile
router.get("/profile", protect, getProfile);


// Update profile picture
router.put(
    "/profile-picture",
    protect,
    upload.single("profilePicture"),
    updateProfilePicture
);

// Update academic profile
router.put("/academic-profile", protect, updateAcademicProfile);

module.exports = router;