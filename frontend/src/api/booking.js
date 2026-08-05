import api from "./auth";

export const createBooking = async (bookingData) => {
  const { data } = await api.post("/bookings", bookingData);
  return data;
};

export const getMyBookings = async (params = {}) => {
  const { data } = await api.get("/bookings", { params });
  return data;
};

export const getBookingById = async (id) => {
  const { data } = await api.get(`/bookings/${id}`);
  return data;
};

export const confirmBooking = async (id, payload = {}) => {
  const { data } = await api.put(`/bookings/${id}/confirm`, payload);
  return data;
};

export const rescheduleBooking = async (id, payload) => {
  const { data } = await api.put(`/bookings/${id}/reschedule`, payload);
  return data;
};

export const cancelBooking = async (id, reason = "") => {
  const { data } = await api.put(`/bookings/${id}/cancel`, { reason });
  return data;
};

export const completeBooking = async (id) => {
  const { data } = await api.put(`/bookings/${id}/complete`);
  return data;
};