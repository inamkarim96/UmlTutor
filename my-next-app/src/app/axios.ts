import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + "/api", 
  withCredentials: true,
});

api.interceptors.response.use(
  r => r,
  err => Promise.reject(err?.response?.data ?? err)
);
