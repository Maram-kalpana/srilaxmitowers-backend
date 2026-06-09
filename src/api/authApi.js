import { apiClient, unwrap } from "./client.js";

export async function loginApi(credentials) {
  const res = await apiClient.post("/auth/login", credentials);
  const data = unwrap(res);
  if (data?.accessToken) localStorage.setItem("erp_access_token", data.accessToken);
  return data;
}

export async function registerApi(payload) {
  const res = await apiClient.post("/auth/register", payload);
  const data = unwrap(res);
  if (data?.accessToken) localStorage.setItem("erp_access_token", data.accessToken);
  return data;
}

export async function logoutApi() {
  await apiClient.post("/auth/logout");
  localStorage.removeItem("erp_access_token");
}

export async function meApi() {
  const res = await apiClient.get("/auth/me");
  return unwrap(res)?.user;
}
