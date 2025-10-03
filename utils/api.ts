import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  // baseURL: "https://pariksha-path-backend.onrender.com/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token automatically
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
      } else {
        config.headers.delete("Authorization");
      }
    }

    // Handle FormData case
    if (
      config.data &&
      typeof FormData !== "undefined" &&
      config.data instanceof FormData
    ) {
      config.headers.delete("Content-Type");
      config.headers.delete("content-type");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Global response handling
api.interceptors.response.use(
  (resp) => resp,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_role");
        window.location.href = "/login"; // central redirect
      }
    } else if (error.response) {
      console.error("API response error:", error.response);
    } else if (error.request) {
      console.error("API no response:", error.request);
    } else {
      console.error("API error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
