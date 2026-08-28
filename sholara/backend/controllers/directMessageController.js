const mongoose = require("mongoose");
const DirectMessage = require("../models/DirectMessage");
const User = require("../models/User");
const { notifyUser } = require("../utils/notificationService");

// POST /api/messages/send - Send a direct message
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, content, attachments } = req.body;
    const senderId = req.user._id;

    if (!recipientId || !content || !content.trim()) {
      return res.status(400).json({
        message: "Recipient ID and message content are required.",
      });
    }

    if (recipientId.toString() === senderId.toString()) {
      return res.status(400).json({
        message: "You cannot send direct messages to yourself.",
      });
    }

    const recipientUser = await User.findById(recipientId);
    if (!recipientUser) {
      return res.status(404).json({ message: "Recipient user not found." });
    }

    const message = await DirectMessage.create({
      sender: senderId,
      recipient: recipientId,
      content: content.trim(),
      attachments: Array.isArray(attachments) ? attachments : [],
    });

    const populated = await DirectMessage.findById(message._id)
      .populate("sender", "fullName email profilePicture department role")
      .populate("recipient", "fullName email profilePicture department role");

    // Trigger notification to recipient
    await notifyUser({
      recipient: recipientId,
      sender: senderId,
      type: "message",
      title: `Message from ${req.user.fullName}`,
      message:
        content.length > 80 ? content.substring(0, 77) + "..." : content,
      link: `/messages?user=${senderId}`,
      metadata: { messageId: message._id, senderId },
    });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({
      message: "Failed to send message",
      error: error.message,
    });
  }
};

// GET /api/messages/conversations - Get list of active conversations
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Aggregate to find latest message with each distinct conversation partner
    const messages = await DirectMessage.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { recipient: userId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", userId] },
              "$recipient",
              "$sender",
            ],
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$recipient", userId] },
                    { $eq: ["$isRead", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $sort: { "lastMessage.createdAt": -1 },
      },
    ]);

    // Populate user info for each conversation partner
    const populated = await Promise.all(
      messages.map(async (conv) => {
        const partner = await User.findById(conv._id).select(
          "fullName email profilePicture department role university"
        );
        return {
          partner,
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount,
        };
      })
    );

    // Filter out any null partners (if user was deleted)
    res.json(populated.filter((c) => c.partner != null));
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch conversations",
      error: error.message,
    });
  }
};

// GET /api/messages/history/:targetUserId - Get message history with a user
exports.getMessageHistory = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.targetUserId;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const messages = await DirectMessage.find({
      $or: [
        { sender: currentUserId, recipient: targetUserId },
        { sender: targetUserId, recipient: currentUserId },
      ],
    })
      .populate("sender", "fullName email profilePicture department role")
      .populate("recipient", "fullName email profilePicture department role")
      .sort({ createdAt: 1 });

    // Mark all unread messages received from target user as read
    await DirectMessage.updateMany(
      {
        sender: targetUserId,
        recipient: currentUserId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch message history",
      error: error.message,
    });
  }
};

// GET /api/messages/users/search - Search users to start new chat
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const currentUserId = req.user._id;

    if (!query || !query.trim()) {
      // Return recent 10 users by default
      const defaultUsers = await User.find({ _id: { $ne: currentUserId } })
        .select("fullName email profilePicture department role university")
        .limit(10);
      return res.json(defaultUsers);
    }

    const searchRegex = new RegExp(query.trim(), "i");

    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        { fullName: searchRegex },
        { email: searchRegex },
        { department: searchRegex },
      ],
    })
      .select("fullName email profilePicture department role university")
      .limit(20);

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: "Failed to search users",
      error: error.message,
    });
  }
};

// GET /api/messages/unread-total - Get total unread count across all conversations
exports.getUnreadTotal = async (req, res) => {
  try {
    const count = await DirectMessage.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });
    res.json({ unreadTotal: count });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get unread total",
      error: error.message,
    });
  }
};

// PUT /api/messages/mark-read/:targetUserId - Explicit mark conversation as read
exports.markConversationAsRead = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.targetUserId;

    await DirectMessage.updateMany(
      {
        sender: targetUserId,
        recipient: currentUserId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    res.json({ success: true, message: "Messages marked as read" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to mark messages as read",
      error: error.message,
    });
  }
};
