import api from "./auth";

export const generateCertificate = async (bookingId) => {
  const { data } = await api.post("/certificates/generate", { bookingId });
  return data;
};

export const getMyCertificates = async () => {
  const { data } = await api.get("/certificates/my-certificates");
  return data;
};

export const getCertificateByBooking = async (bookingId) => {
  const { data } = await api.get(`/certificates/booking/${bookingId}`);
  return data;
};

export const getCertificateById = async (id) => {
  const { data } = await api.get(`/certificates/${id}`);
  return data;
};

export const verifyCertificate = async (code) => {
  const { data } = await api.get(`/certificates/verify/${code}`);
  return data;
};
