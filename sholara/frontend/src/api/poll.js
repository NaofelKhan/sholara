import api from "./auth";

export const getCoursePolls = async (courseId) => {
  const { data } = await api.get(`/courses/${courseId}/polls`);
  return data;
};

export const createPoll = async (courseId, pollData) => {
  const { data } = await api.post(`/courses/${courseId}/polls`, pollData);
  return data;
};

export const submitPollResponse = async (courseId, pollId, responseData) => {
  const { data } = await api.post(`/courses/${courseId}/polls/${pollId}/respond`, responseData);
  return data;
};

export const togglePollStatus = async (courseId, pollId) => {
  const { data } = await api.put(`/courses/${courseId}/polls/${pollId}/toggle`);
  return data;
};

export const deletePoll = async (courseId, pollId) => {
  const { data } = await api.delete(`/courses/${courseId}/polls/${pollId}`);
  return data;
};
