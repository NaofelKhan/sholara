const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  sendMessage,
  getConversations,
  getMessageHistory,
  searchUsers,
  getUnreadTotal,
  markConversationAsRead,
} = require("../controllers/directMessageController");

router.use(protect);

router.post("/send", sendMessage);
router.get("/conversations", getConversations);
router.get("/users/search", searchUsers);
router.get("/unread-total", getUnreadTotal);
router.put("/mark-read/:targetUserId", markConversationAsRead);
router.get("/:targetUserId", getMessageHistory);

module.exports = router;
