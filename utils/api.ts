// api.ts
import axios, { AxiosError } from "axios";

// Create a mock token for testing purposes
const MOCK_TOKEN =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

// For development, store a mock token in localStorage
if (typeof window !== "undefined" && !localStorage.getItem("access_token")) {
	localStorage.setItem("access_token", MOCK_TOKEN);
}

const api = axios.create({
	baseURL: "http://localhost:8000/api/v1",
	// baseURL: "https://pariksha-path-backend.vercel.app/api/v1",
	headers: {
		"Content-Type": "application/json",
		// Add a default Authorization header for all requests
		Authorization: `Bearer ${MOCK_TOKEN}`,
	},
});

// Add token to request if exists
api.interceptors.request.use(
	(config) => {
		if (typeof window !== "undefined") {
			const token = localStorage.getItem("access_token");
			if (token) {
				if (!config.headers) {
					config.headers = axios.defaults.headers as any;
				}
				config.headers.Authorization = `Bearer ${token}`;
			}
		}

		// If sending FormData, delete any Content-Type so browser sets boundary
		if (
			config.data &&
			typeof FormData !== "undefined" &&
			config.data instanceof FormData
		) {
			if (config.headers) {
				// axios sometimes uses lowercase header keys depending on environment
				delete (config.headers as any)["Content-Type"];
				delete (config.headers as any)["content-type"];
			}
		}

		return config;
	},
	(error) => Promise.reject(error)
);

// Handle 401 Unauthorized responses
api.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		if (error.response?.status === 401) {
			if (typeof window !== "undefined") {
				localStorage.removeItem("access_token");
				window.location.href = "/login";
			}
		} else if (error.response) {
			console.error(error.response);
		} else if (error.request) {
			console.error(error.request);
		} else {
			console.error(error.message);
		}
		return Promise.reject(error);
	}
);

export default api;
