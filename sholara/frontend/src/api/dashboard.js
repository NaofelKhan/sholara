import api from "./auth";

export const getDashboard = async () => {
  const { data } = await api.get("/dashboard");
  return data;
};
