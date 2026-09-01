const express = require("express");
const router = express.Router();

const {
  createMarketplaceSkill,
  getMarketplaceSkills,
  deleteMarketplaceSkill,
} = require("../controllers/marketplaceSkillController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createMarketplaceSkill);

router.get("/", getMarketplaceSkills);

router.delete("/:id", protect, deleteMarketplaceSkill);

module.exports = router;