import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("erp_access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post(
          `${API_BASE}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        if (data?.data?.accessToken) {
          localStorage.setItem("erp_access_token", data.data.accessToken);
          original.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return apiClient(original);
        }
      } catch {
        localStorage.removeItem("erp_access_token");
        localStorage.removeItem("erp_auth");
      }
    }
    return Promise.reject(error);
  }
);

export function unwrap(response) {
  return response.data?.data;
}

export const USE_API = import.meta.env.VITE_USE_API !== "false";
