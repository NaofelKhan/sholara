import api from "./auth";

export const getNotices = async (params = {}) => {
  const { data } = await api.get("/notices", { params });
  return data;
};

export const getNoticeById = async (id) => {
  const { data } = await api.get(`/notices/${id}`);
  return data;
};

export const getMyNotices = async () => {
  const { data } = await api.get("/notices/mine");
  return data;
};

export const createNotice = async (formData) => {
  const { data } = await api.post("/notices", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateNotice = async (id, formData) => {
  const { data } = await api.put(`/notices/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteNotice = async (id) => {
  const { data } = await api.delete(`/notices/${id}`);
  return data;
};