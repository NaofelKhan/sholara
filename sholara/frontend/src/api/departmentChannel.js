import api from "./auth";

// Department Channels API
export const getDepartmentPosts = async (department = "All", category = "All") => {
  const { data } = await api.get("/department-channels", {
    params: { department, category },
  });
  return data;
};

export const createDepartmentPost = async (postData) => {
  const { data } = await api.post("/department-channels", postData);
  return data;
};

export const togglePinDepartmentPost = async (id) => {
  const { data } = await api.put(`/department-channels/${id}/pin`);
  return data;
};

export const deleteDepartmentPost = async (id) => {
  const { data } = await api.delete(`/department-channels/${id}`);
  return data;
};

export const addDepartmentPostComment = async (id, content) => {
  const { data } = await api.post(`/department-channels/${id}/comments`, { content });
  return data;
};
