const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createReview,
  getBookingReview,
  getUserReviews,
  getSkillReviews,
} = require("../controllers/reviewController");

// Public endpoints
router.get("/user/:userId", getUserReviews);
router.get("/skill/:skillId", getSkillReviews);

// Protected endpoints
router.use(protect);
router.post("/", createReview);
router.get("/booking/:bookingId", getBookingReview);

module.exports = router;
