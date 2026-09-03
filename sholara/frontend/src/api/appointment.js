import api from "./auth";

export const getFacultySlots = async (facultyId, date) => {
  const { data } = await api.get(`/appointments/slots/${facultyId}`, {
    params: { date },
  });
  return data;
};

export const bookAppointment = async (payload) => {
  const { data } = await api.post("/appointments/book", payload);
  return data;
};

export const getMyAppointments = async () => {
  const { data } = await api.get("/appointments/mine");
  return data;
};

export const getFacultyMembers = async () => {
  const { data } = await api.get("/appointments/faculty");
  return data;
};

// Faculty/TA availability management
export const createAvailability = async (payload) => {
  const { data } = await api.post("/appointments/availability", payload);
  return data;
};

export const getMyAvailability = async () => {
  const { data } = await api.get("/appointments/availability/mine");
  return data;
};

export const deleteAvailability = async (id) => {
  const { data } = await api.delete(`/appointments/availability/${id}`);
  return data;
};