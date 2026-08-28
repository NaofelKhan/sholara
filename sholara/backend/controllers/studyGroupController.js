const StudyGroup = require("../models/StudyGroup");
const StudyGroupResource = require("../models/StudyGroupResource");
const StudyGroupSession = require("../models/StudyGroupSession");
const StudyGroupMessage = require("../models/StudyGroupMessage");

// Generate unique join code for study groups
const generateGroupJoinCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "GRP-";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// GET /api/study-groups - Get all study groups (joined & available)
exports.getStudyGroups = async (req, res) => {
  try {
    const groups = await StudyGroup.find()
      .populate("creator", "fullName email profilePicture department")
      .populate("members", "fullName email profilePicture")
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch study groups", error: error.message });
  }
};

// POST /api/study-groups - Create a new study group
exports.createStudyGroup = async (req, res) => {
  try {
    const { title, subject, description, maxMembers, meetingLocation, coverGradient } = req.body;

    if (!title || !subject) {
      return res.status(400).json({ message: "Title and Subject are required" });
    }

    let joinCode = generateGroupJoinCode();
    let existing = await StudyGroup.findOne({ joinCode });
    while (existing) {
      joinCode = generateGroupJoinCode();
      existing = await StudyGroup.findOne({ joinCode });
    }

    const group = await StudyGroup.create({
      title,
      subject,
      description: description || "",
      creator: req.user._id,
      joinCode,
      members: [req.user._id],
      maxMembers: maxMembers || 10,
      meetingLocation: meetingLocation || "Online / Library",
      coverGradient: coverGradient || "from-[#002045] to-[#003730]",
    });

    const populatedGroup = await StudyGroup.findById(group._id)
      .populate("creator", "fullName email profilePicture department")
      .populate("members", "fullName email profilePicture");

    res.status(201).json(populatedGroup);
  } catch (error) {
    res.status(500).json({ message: "Failed to create study group", error: error.message });
  }
};

// POST /api/study-groups/join - Join group by code or ID
exports.joinStudyGroup = async (req, res) => {
  try {
    const { joinCode, groupId } = req.body;

    let group;
    if (joinCode) {
      group = await StudyGroup.findOne({ joinCode: joinCode.trim().toUpperCase() });
    } else if (groupId) {
      group = await StudyGroup.findById(groupId);
    }

    if (!group) {
      return res.status(404).json({ message: "Study group not found" });
    }

    if (group.members.includes(req.user._id)) {
      return res.status(400).json({ message: "You are already a member of this study group" });
    }

    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({ message: "Study group has reached maximum member capacity" });
    }

    group.members.push(req.user._id);
    await group.save();

    const populatedGroup = await StudyGroup.findById(group._id)
      .populate("creator", "fullName email profilePicture department")
      .populate("members", "fullName email profilePicture");

    res.json(populatedGroup);
  } catch (error) {
    res.status(500).json({ message: "Failed to join study group", error: error.message });
  }
};

// GET /api/study-groups/:id - Get single study group details
exports.getStudyGroupById = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id)
      .populate("creator", "fullName email profilePicture department role")
      .populate("members", "fullName email profilePicture studentId department role");

    if (!group) {
      return res.status(404).json({ message: "Study group not found" });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch study group details", error: error.message });
  }
};

// DELETE /api/study-groups/:id - Delete study group
exports.deleteStudyGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Study group not found" });
    }

    if (group.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the group creator can delete this group" });
    }

    await StudyGroup.findByIdAndDelete(req.params.id);
    await StudyGroupResource.deleteMany({ group: req.params.id });
    await StudyGroupSession.deleteMany({ group: req.params.id });
    await StudyGroupMessage.deleteMany({ group: req.params.id });

    res.json({ message: "Study group deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete study group", error: error.message });
  }
};

// DELETE /api/study-groups/:id/members/:memberId - Leave or remove member
exports.removeMember = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Study group not found" });
    }

    const isCreator = group.creator.toString() === req.user._id.toString();
    const isSelf = req.params.memberId === req.user._id.toString();

    if (!isCreator && !isSelf) {
      return res.status(403).json({ message: "Not authorized to remove member" });
    }

    group.members = group.members.filter((m) => m.toString() !== req.params.memberId);
    await group.save();

    res.json({ message: "Member removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove member", error: error.message });
  }
};

// --- GROUP DISCUSSIONS / MESSAGES ---

// GET /api/study-groups/:id/messages
exports.getMessages = async (req, res) => {
  try {
    const messages = await StudyGroupMessage.find({ group: req.params.id })
      .populate("sender", "fullName profilePicture role")
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch group messages", error: error.message });
  }
};

// POST /api/study-groups/:id/messages
exports.postMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: "Message content is required" });
    }

    const newMsg = await StudyGroupMessage.create({
      group: req.params.id,
      sender: req.user._id,
      message,
    });

    const populated = await StudyGroupMessage.findById(newMsg._id).populate(
      "sender",
      "fullName profilePicture role"
    );

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Failed to send message", error: error.message });
  }
};

// --- SHARED RESOURCES ---

// GET /api/study-groups/:id/resources
exports.getResources = async (req, res) => {
  try {
    const resources = await StudyGroupResource.find({ group: req.params.id })
      .populate("uploadedBy", "fullName profilePicture")
      .sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch study resources", error: error.message });
  }
};

// POST /api/study-groups/:id/resources
exports.createResource = async (req, res) => {
  try {
    const { title, description, fileUrl, fileType } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Resource title is required" });
    }

    const resource = await StudyGroupResource.create({
      group: req.params.id,
      title,
      description: description || "",
      fileUrl: fileUrl || "",
      fileType: fileType || "link",
      uploadedBy: req.user._id,
    });

    const populated = await StudyGroupResource.findById(resource._id).populate(
      "uploadedBy",
      "fullName profilePicture"
    );

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Failed to share resource", error: error.message });
  }
};

// DELETE /api/study-groups/:id/resources/:resourceId
exports.deleteResource = async (req, res) => {
  try {
    await StudyGroupResource.findByIdAndDelete(req.params.resourceId);
    res.json({ message: "Resource deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete resource", error: error.message });
  }
};

// --- STUDY SESSIONS ---

// GET /api/study-groups/:id/sessions
exports.getSessions = async (req, res) => {
  try {
    const sessions = await StudyGroupSession.find({ group: req.params.id })
      .populate("createdBy", "fullName profilePicture")
      .populate("attendees", "fullName profilePicture")
      .sort({ scheduledAt: 1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch study sessions", error: error.message });
  }
};

// POST /api/study-groups/:id/sessions
exports.createSession = async (req, res) => {
  try {
    const { title, description, scheduledAt, locationOrLink } = req.body;
    if (!title || !scheduledAt) {
      return res.status(400).json({ message: "Title and Scheduled Date/Time are required" });
    }

    const session = await StudyGroupSession.create({
      group: req.params.id,
      title,
      description: description || "",
      scheduledAt,
      locationOrLink: locationOrLink || "Library Study Room",
      createdBy: req.user._id,
      attendees: [req.user._id],
    });

    const populated = await StudyGroupSession.findById(session._id)
      .populate("createdBy", "fullName profilePicture")
      .populate("attendees", "fullName profilePicture");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Failed to schedule study session", error: error.message });
  }
};

// PUT /api/study-groups/:id/sessions/:sessionId/rsvp
exports.toggleRSVP = async (req, res) => {
  try {
    const session = await StudyGroupSession.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const isAttending = session.attendees.includes(req.user._id);

    if (isAttending) {
      session.attendees = session.attendees.filter((id) => id.toString() !== req.user._id.toString());
    } else {
      session.attendees.push(req.user._id);
    }

    await session.save();

    const updated = await StudyGroupSession.findById(session._id)
      .populate("createdBy", "fullName profilePicture")
      .populate("attendees", "fullName profilePicture");

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update RSVP", error: error.message });
  }
};
