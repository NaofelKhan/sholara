const DepartmentPost = require("../models/DepartmentPost");

// GET /api/department-channels - Fetch department channel posts
exports.getDepartmentPosts = async (req, res) => {
  try {
    const { department, category } = req.query;

    const filter = {};
    if (department && department !== "All") {
      filter.department = department;
    }
    if (category && category !== "All") {
      filter.category = category;
    }

    const posts = await DepartmentPost.find(filter)
      .populate("author", "fullName email profilePicture role department")
      .populate("comments.author", "fullName profilePicture role")
      .sort({ isPinned: -1, createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch department channel posts", error: error.message });
  }
};

// POST /api/department-channels - Create new department post
exports.createDepartmentPost = async (req, res) => {
  try {
    const { title, content, department, category, isPinned, fileUrl } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and Content are required" });
    }

    const post = await DepartmentPost.create({
      title,
      content,
      department: department || req.user.department || "Computer Science & Engineering",
      category: category || "notice",
      isPinned: isPinned || false,
      fileUrl: fileUrl || "",
      author: req.user._id,
    });

    const populated = await DepartmentPost.findById(post._id)
      .populate("author", "fullName email profilePicture role department")
      .populate("comments.author", "fullName profilePicture role");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Failed to create department post", error: error.message });
  }
};

// PUT /api/department-channels/:id/pin - Toggle pin status
exports.togglePinPost = async (req, res) => {
  try {
    const post = await DepartmentPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Department post not found" });
    }

    post.isPinned = !post.isPinned;
    await post.save();

    const updated = await DepartmentPost.findById(post._id)
      .populate("author", "fullName email profilePicture role department")
      .populate("comments.author", "fullName profilePicture role");

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle pin state", error: error.message });
  }
};

// DELETE /api/department-channels/:id - Delete post
exports.deleteDepartmentPost = async (req, res) => {
  try {
    const post = await DepartmentPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Department post not found" });
    }

    const isAuthor = post.author.toString() === req.user._id.toString();
    const isTeacher = req.user.role === "teacher" || req.user.role === "faculty" || req.user.role === "admin";

    if (!isAuthor && !isTeacher) {
      return res.status(403).json({ message: "Not authorized to delete this department post" });
    }

    await DepartmentPost.findByIdAndDelete(req.params.id);
    res.json({ message: "Department post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete post", error: error.message });
  }
};

// POST /api/department-channels/:id/comments - Add comment to post
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const post = await DepartmentPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Department post not found" });
    }

    post.comments.push({
      author: req.user._id,
      content,
      createdAt: new Date(),
    });

    await post.save();

    const updated = await DepartmentPost.findById(post._id)
      .populate("author", "fullName email profilePicture role department")
      .populate("comments.author", "fullName profilePicture role");

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to add comment", error: error.message });
  }
};
