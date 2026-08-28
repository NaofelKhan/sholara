import api from "./auth";

export const sendMessage = async ({ recipientId, content, attachments = [] }) => {
  const { data } = await api.post("/messages/send", { recipientId, content, attachments });
  return data;
};

export const getConversations = async () => {
  const { data } = await api.get("/messages/conversations");
  return data;
};

export const getMessageHistory = async (targetUserId) => {
  const { data } = await api.get(`/messages/${targetUserId}`);
  return data;
};

export const searchUsers = async (query = "") => {
  const { data } = await api.get("/messages/users/search", { params: { query } });
  return data;
};

export const getUnreadTotal = async () => {
  const { data } = await api.get("/messages/unread-total");
  return data;
};

export const markConversationAsRead = async (targetUserId) => {
  const { data } = await api.put(`/messages/mark-read/${targetUserId}`);
  return data;
};
