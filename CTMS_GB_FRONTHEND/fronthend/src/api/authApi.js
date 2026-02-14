import api from "./axiosConfig";

// Login API
export const login = async (username, password) => {
  const res = await api.post("/auth/login/", { username, password });
  return res.data; // Backend ka response
};
