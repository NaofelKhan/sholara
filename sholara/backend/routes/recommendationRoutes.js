const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getRecommendedSkills,
  getRecommendedRequests,
} = require("../controllers/recommendationController");

// All recommendation routes require login (recommendations are personalized)
router.use(protect);

router.get("/skills", getRecommendedSkills);
router.get("/requests", getRecommendedRequests);

module.exports = router;