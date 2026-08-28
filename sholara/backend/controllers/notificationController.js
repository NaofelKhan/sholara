const Notification = require("../models/Notification");

// GET /api/notifications - Get all notifications for current user with optional filters
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, isRead, limit = 50, page = 1 } = req.query;

    const query = { recipient: userId };

    if (type && type !== "all") {
      query.type = type;
    }

    if (isRead !== undefined && isRead !== "all") {
      query.isRead = isRead === "true" || isRead === true;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, totalCount, unreadCount] = await Promise.all([
      Notification.find(query)
        .populate("sender", "fullName email profilePicture department role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments(query),
      Notification.countDocuments({ recipient: userId, isRead: false }),
    ]);

    res.json({
      notifications,
      totalCount,
      unreadCount,
      page: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

// GET /api/notifications/unread-count - Get total unread notifications count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });
    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get unread count",
      error: error.message,
    });
  }
};

// PUT /api/notifications/:id/read - Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    ).populate("sender", "fullName email profilePicture department role");

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
};

// PUT /api/notifications/mark-all-read - Mark all user's notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ message: "All notifications marked as read", success: true });
  } catch (error) {
    res.status(500).json({
      message: "Failed to mark all notifications as read",
      error: error.message,
    });
  }
};

// DELETE /api/notifications/:id - Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const deleted = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete notification",
      error: error.message,
    });
  }
};

// DELETE /api/notifications/clear-all - Delete all read notifications
exports.clearReadNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({
      recipient: req.user._id,
      isRead: true,
    });

    res.json({ message: "Read notifications cleared successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to clear notifications",
      error: error.message,
    });
  }
};
