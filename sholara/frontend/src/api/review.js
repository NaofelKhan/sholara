import api from "./auth";

export const createReview = async (reviewData) => {
  const { data } = await api.post("/reviews", reviewData);
  return data;
};

export const getBookingReview = async (bookingId) => {
  const { data } = await api.get(`/reviews/booking/${bookingId}`);
  return data;
};

export const getUserReviews = async (userId) => {
  const { data } = await api.get(`/reviews/user/${userId}`);
  return data;
};

export const getSkillReviews = async (skillId) => {
  const { data } = await api.get(`/reviews/skill/${skillId}`);
  return data;
};
