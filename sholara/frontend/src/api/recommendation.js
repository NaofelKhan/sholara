import api from "./auth";

// Recommended marketplace skills for the logged-in user to learn/book
export const getRecommendedSkills = async () => {
  const { data } = await api.get("/recommendations/skills");
  return data;
};

// Recommended skill requests the logged-in mentor could fulfill
export const getRecommendedRequests = async () => {
  const { data } = await api.get("/recommendations/requests");
  return data;
};