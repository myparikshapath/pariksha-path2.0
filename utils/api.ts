import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to request if exists
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      // Ensure we're in the browser
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 Unauthorized responses
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        // Redirect to login page
        window.location.href = "/login";
      }
    } else if (error.response) {
      // Handle other error responses
      console.error(error.response);
    } else if (error.request) {
      // Handle no response
      console.error(error.request);
    } else {
      // Handle other errors
      console.error(error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
