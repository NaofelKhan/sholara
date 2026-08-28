import api from "./auth";

// Study Groups API
export const getStudyGroups = async () => {
  const { data } = await api.get("/study-groups");
  return data;
};

export const createStudyGroup = async (groupData) => {
  const { data } = await api.post("/study-groups", groupData);
  return data;
};

export const joinStudyGroup = async (payload) => {
  // payload can be { joinCode } or { groupId }
  const { data } = await api.post("/study-groups/join", payload);
  return data;
};

export const getStudyGroupById = async (id) => {
  const { data } = await api.get(`/study-groups/${id}`);
  return data;
};

export const deleteStudyGroup = async (id) => {
  const { data } = await api.delete(`/study-groups/${id}`);
  return data;
};

export const removeMemberFromGroup = async (groupId, memberId) => {
  const { data } = await api.delete(`/study-groups/${groupId}/members/${memberId}`);
  return data;
};

// Group Messages / Chat API
export const getGroupMessages = async (groupId) => {
  const { data } = await api.get(`/study-groups/${groupId}/messages`);
  return data;
};

export const sendGroupMessage = async (groupId, message) => {
  const { data } = await api.post(`/study-groups/${groupId}/messages`, { message });
  return data;
};

// Shared Resources API
export const getGroupResources = async (groupId) => {
  const { data } = await api.get(`/study-groups/${groupId}/resources`);
  return data;
};

export const createGroupResource = async (groupId, resourceData) => {
  const { data } = await api.post(`/study-groups/${groupId}/resources`, resourceData);
  return data;
};

export const deleteGroupResource = async (groupId, resourceId) => {
  const { data } = await api.delete(`/study-groups/${groupId}/resources/${resourceId}`);
  return data;
};

// Study Sessions API
export const getGroupSessions = async (groupId) => {
  const { data } = await api.get(`/study-groups/${groupId}/sessions`);
  return data;
};

export const createGroupSession = async (groupId, sessionData) => {
  const { data } = await api.post(`/study-groups/${groupId}/sessions`, sessionData);
  return data;
};

export const toggleSessionRSVP = async (groupId, sessionId) => {
  const { data } = await api.put(`/study-groups/${groupId}/sessions/${sessionId}/rsvp`);
  return data;
};
