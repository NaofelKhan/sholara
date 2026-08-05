const express = require("express");
const router = express.Router();

const {
  getAllSkillRequests,
  getSkillRequestById,
  createSkillRequest,
  updateSkillRequest,
  deleteSkillRequest,
  saveAsDraft,
} = require("../controllers/skillRequestController");

const { protect } = require("../middleware/authMiddleware");

// Save as draft
router.post("/draft", protect, saveAsDraft);

// List all requests & Create request
router
  .route("/")
  .get(getAllSkillRequests)
  .post(protect, createSkillRequest);

// Get, Update, Delete a request
router
  .route("/:id")
  .get(getSkillRequestById)
  .put(protect, updateSkillRequest)
  .delete(protect, deleteSkillRequest);

module.exports = router;