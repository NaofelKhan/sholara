const Notice = require("../models/Notice");
const cloudinary = require("../config/cloudinary");

const createNotice = async (req, res) => {
  try {
    let coverImage = "";

    if (req.file) {
      const file = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      const uploadResult = await cloudinary.uploader.upload(file, {
        folder: "scholara/notices",
      });
      coverImage = uploadResult.secure_url;
    }

    let tags = [];
    if (req.body.tags) {
      tags = Array.isArray(req.body.tags)
        ? req.body.tags
        : JSON.parse(req.body.tags || "[]");
    }

    const notice = await Notice.create({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category || "Announcement",
      university: req.body.university || req.user.university || "",
      department: req.body.department || "All Departments",
      coverImage,
      eventDate: req.body.eventDate || null,
      deadline: req.body.deadline || null,
      location: req.body.location || "",
      registrationLink: req.body.registrationLink || "",
      tags,
      priority: req.body.priority || "normal",
      status: req.body.status || "published",
      author: req.user._id,
    });

    const populated = await Notice.findById(notice._id).populate(
      "author",
      "fullName profilePicture department university role"
    );

    res.status(201).json({
      success: true,
      message: "Notice published successfully.",
      notice: populated,
    });
  } catch (error) {
    console.error("Create Notice Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create notice.",
    });
  }
};

const getNotices = async (req, res) => {
  try {
    const { category, university, department, search, priority } = req.query;
    const filter = { status: "published" };

    if (category && category !== "All") filter.category = category;
    if (university) filter.university = university;
    if (department && department !== "All Departments") filter.department = department;
    if (priority) filter.priority = priority;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    const notices = await Notice.find(filter)
      .populate("author", "fullName profilePicture department university role")
      .sort({ priority: -1, createdAt: -1 });

    res.json({ success: true, count: notices.length, notices });
  } catch (error) {
    console.error("Get Notices Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getNoticeById = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate("author", "fullName profilePicture department university role");

    if (!notice || notice.status !== "published") {
      return res.status(404).json({ success: false, message: "Notice not found." });
    }

    res.json({ success: true, notice });
  } catch (error) {
    console.error("Get Notice Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ success: false, message: "Notice not found." });
    }
    if (notice.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    if (req.file) {
      const file = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      const uploadResult = await cloudinary.uploader.upload(file, {
        folder: "scholara/notices",
      });
      notice.coverImage = uploadResult.secure_url;
    }

    const fields = [
      "title", "description", "category", "university", "department",
      "eventDate", "deadline", "location", "registrationLink", "priority", "status",
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) notice[f] = req.body[f];
    });

    if (req.body.tags) {
      notice.tags = Array.isArray(req.body.tags)
        ? req.body.tags
        : JSON.parse(req.body.tags || "[]");
    }

    await notice.save();
    const populated = await Notice.findById(notice._id).populate(
      "author",
      "fullName profilePicture department university role"
    );

    res.json({ success: true, message: "Notice updated.", notice: populated });
  } catch (error) {
    console.error("Update Notice Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ success: false, message: "Notice not found." });
    }
    if (notice.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }
    await notice.deleteOne();
    res.json({ success: true, message: "Notice deleted." });
  } catch (error) {
    console.error("Delete Notice Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyNotices = async (req, res) => {
  try {
    const notices = await Notice.find({ author: req.user._id })
      .populate("author", "fullName profilePicture department university role")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: notices.length, notices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createNotice,
  getNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
  getMyNotices,
};