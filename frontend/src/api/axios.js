// Shared Axios client for all frontend API calls.
import axios from "axios";

// Default to localhost explicitly if the env var is somehow missing.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// Central client so base URL and cookie handling stay consistent everywhere.
const axiosInstance = axios.create({
    // All requests are sent to backend API prefix.
    baseURL: API_BASE_URL,
    // Include cookies (JWT session cookie) automatically.
    withCredentials: true

})

export default axiosInstance;
