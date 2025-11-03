import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import SecureTokenStorage from "./secureStorage";

// Set up logging for this module
const logger = (message: string, data?: unknown) => {
  console.log(`[API] ${message}`, data ? data : "");
};

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  // baseURL: "http://myparikshapath-env.eba-rbnf3ip3.ap-south-1.elasticbeanstalk.com/api/v1"
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Attach token automatically and log requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = SecureTokenStorage.getAccessToken();
      if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
        logger(`Request to ${config.method?.toUpperCase()} ${config.url}`, {
          headers: { ...config.headers, Authorization: "Bearer ****" }, // Redact token
          data: config.data,
        });
      } else {
        logger(`Request to ${config.method?.toUpperCase()} ${config.url} (No token)`, {
          headers: config.headers,
          data: config.data,
        });
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
  (error) => {
    logger("Request interceptor error", error.message);
    return Promise.reject(error);
  }
);

// Response interceptor - Log responses and errors
api.interceptors.response.use(
  (response) => {
    logger(`Response from ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data,
      headers: response.headers,
    });
    return response;
  },
  (error: AxiosError) => {
    logger(`Response error from ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      headers: error.response?.headers,
    });
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh and logout
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (resp) => resp,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        }).catch(err => {
          throw err;
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = SecureTokenStorage.getRefreshToken();
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Attempt to refresh token
        const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {}, {
          headers: {
            "Authorization": `Bearer ${refreshToken}`,
            "Content-Type": "application/json"
          }
        });

        const { access_token, refresh_token } = response.data;

        // Update stored tokens
        SecureTokenStorage.setAccessToken(access_token);
        if (refresh_token) {
          SecureTokenStorage.setRefreshToken(refresh_token);
        }

        // Process queued requests
        processQueue(null, access_token);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        processQueue(refreshError, null);

        if (typeof window !== "undefined") {
          SecureTokenStorage.clearAllTokens();

          // Dispatch logout event to other tabs
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'logout',
            newValue: Date.now().toString(),
            storageArea: localStorage
          }));

          // Redirect to login page
          if (window.location.pathname !== '/login') {
            window.location.href = "/login";
          }
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response) {
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
