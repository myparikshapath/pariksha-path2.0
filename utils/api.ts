import axios from "axios";

const api = axios.create({
	baseURL: "https://pariksha-path-backend.vercel.app/api/v1", // FastAPI base URL
	// baseURL: "http://localhost:8000/api/v1", // FastAPI base URL
	headers: {
		"Content-Type": "application/json",
	},
});

// Add token to request if exists
api.interceptors.request.use((config) => {
	const token = localStorage.getItem("access_token");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

export default api;
