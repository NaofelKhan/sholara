import api from "./auth";

// Department Channels List API
export const getDepartmentChannels = async () => {
  const { data } = await api.get("/department-channels/channels");
  return data;
};

export const createDepartmentChannel = async (channelData) => {
  const { data } = await api.post("/department-channels/channels", channelData);
  return data;
};

// Department Channels Posts API
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
