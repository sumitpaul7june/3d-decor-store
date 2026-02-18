// Shared Axios client for all frontend API calls.
import axios from "axios";

// Central client so base URL and cookie handling stay consistent everywhere.
const axiosInstance = axios.create({
    // All requests are sent to backend API prefix.
    baseURL: "http://localhost:8000/api",
    // Include cookies (JWT session cookie) automatically.
    withCredentials: true

})

export default axiosInstance;
