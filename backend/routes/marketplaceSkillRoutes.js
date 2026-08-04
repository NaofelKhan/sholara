const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  createMarketplaceSkill,
  getMarketplaceSkills,
} = require("../controllers/marketplaceSkillController");

// Public
router.get("/", getMarketplaceSkills);

// Private
router.post(
  "/",
  protect,
  upload.single("coverImage"),
  createMarketplaceSkill
);

module.exports = router;