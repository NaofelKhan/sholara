const Notification = require("../models/Notification");

/**
 * Dispatches a notification to a single user.
 */
const notifyUser = async ({
  recipient,
  sender = null,
  type,
  title,
  message,
  link = "",
  metadata = {},
}) => {
  try {
    if (!recipient || !type || !title || !message) {
      return null;
    }

    // Don't notify yourself
    if (sender && recipient.toString() === sender.toString()) {
      return null;
    }

    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      link,
      metadata,
    });

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

/**
 * Dispatches the same notification to multiple recipients (e.g. course members).
 */
const notifyMultipleUsers = async ({
  recipients = [],
  sender = null,
  type,
  title,
  message,
  link = "",
  metadata = {},
}) => {
  try {
    if (!recipients || recipients.length === 0 || !type || !title || !message) {
      return [];
    }

    const validRecipients = recipients.filter(
      (r) => !sender || r.toString() !== sender.toString()
    );

    if (validRecipients.length === 0) return [];

    const notifications = validRecipients.map((recipient) => ({
      recipient,
      sender,
      type,
      title,
      message,
      link,
      metadata,
    }));

    const result = await Notification.insertMany(notifications);
    return result;
  } catch (error) {
    console.error("Error creating bulk notifications:", error);
    return [];
  }
};

module.exports = {
  notifyUser,
  notifyMultipleUsers,
};
