import axios from "axios";

export const api = axios.create({
  baseURL: "/api", // change if needed
  withCredentials: true, // if you use cookies/sessions
});

// Optional: interceptors
api.interceptors.response.use(
  r => r,
  err => Promise.reject(err?.response?.data ?? err)
);