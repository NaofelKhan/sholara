import api from "./auth";

export const getAdminUsers = async (params = {}) => {
  const { data } = await api.get("/admin/users", { params });
  return data;
};

export const updateUserRole = async (userId, role) => {
  const { data } = await api.put(`/admin/users/${userId}/role`, { role });
  return data;
};

export const getAdminStats = async () => {
  const { data } = await api.get("/admin/stats");
  return data;
};

export const getDepartmentStats = async () => {
  const { data } = await api.get("/admin/departments");
  return data;
};
