const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getChannels,
  createChannel,
  getDepartmentPosts,
  createDepartmentPost,
  togglePinPost,
  deleteDepartmentPost,
  addComment,
} = require("../controllers/departmentChannelController");

router.use(protect);

// Department Channel Management
router.get("/channels", getChannels);
router.post("/channels", createChannel);

// Department Channel Posts
router.get("/", getDepartmentPosts);
router.post("/", createDepartmentPost);
router.put("/:id/pin", togglePinPost);
router.delete("/:id", deleteDepartmentPost);
router.post("/:id/comments", addComment);

module.exports = router;
