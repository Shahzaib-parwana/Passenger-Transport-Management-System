import axios from "axios";
const apiPrivate = axios.create({
  // baseURL: "http://127.0.0.1:8000/api/",
  baseURL: "/api",

});

apiPrivate.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiPrivate;
