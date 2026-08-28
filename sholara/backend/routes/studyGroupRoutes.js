const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getStudyGroups,
  createStudyGroup,
  joinStudyGroup,
  getStudyGroupById,
  deleteStudyGroup,
  removeMember,
  getMessages,
  postMessage,
  getResources,
  createResource,
  deleteResource,
  getSessions,
  createSession,
  toggleRSVP,
} = require("../controllers/studyGroupController");

router.use(protect);

// Study Groups
router.get("/", getStudyGroups);
router.post("/", createStudyGroup);
router.post("/join", joinStudyGroup);
router.get("/:id", getStudyGroupById);
router.delete("/:id", deleteStudyGroup);
router.delete("/:id/members/:memberId", removeMember);

// Messages / Chat
router.get("/:id/messages", getMessages);
router.post("/:id/messages", postMessage);

// Shared Resources
router.get("/:id/resources", getResources);
router.post("/:id/resources", createResource);
router.delete("/:id/resources/:resourceId", deleteResource);

// Study Sessions
router.get("/:id/sessions", getSessions);
router.post("/:id/sessions", createSession);
router.put("/:id/sessions/:sessionId/rsvp", toggleRSVP);

module.exports = router;
