const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  createNotice,
  getNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
  getMyNotices,
} = require("../controllers/noticeController");

router.get("/", getNotices);
router.get("/mine", protect, getMyNotices);
router.post("/", protect, upload.single("coverImage"), createNotice);
router.get("/:id", getNoticeById);
router.put("/:id", protect, upload.single("coverImage"), updateNotice);
router.delete("/:id", protect, deleteNotice);

module.exports = router;