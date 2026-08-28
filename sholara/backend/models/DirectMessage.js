const mongoose = require("mongoose");

const directMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    attachments: [
      {
        fileUrl: { type: String, default: "" },
        fileName: { type: String, default: "" },
        fileType: { type: String, default: "" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Optimize query for 1-on-1 thread retrieval
directMessageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
directMessageSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model("DirectMessage", directMessageSchema);
