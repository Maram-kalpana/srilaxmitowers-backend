import { apiClient, unwrap } from "./client.js";

const resources = {
  projects: "/projects",
  employees: "/employees",
  vehicles: "/vehicles",
  machines: "/machines",
  expenses: "/expenses",
  workDetails: "/work-details",
  attendance: "/attendance",
};

export async function fetchAll(resource) {
  const path = resources[resource];
  const res = await apiClient.get(`${path}/all`);
  return unwrap(res)?.items ?? [];
}

export async function createItem(resource, body) {
  const path = resources[resource];
  const res = await apiClient.post(path, body);
  return unwrap(res)?.item;
}

export async function updateItem(resource, id, body) {
  const path = resources[resource];
  const res = await apiClient.put(`${path}/${id}`, body);
  return unwrap(res)?.item;
}

export async function deleteItem(resource, id) {
  const path = resources[resource];
  await apiClient.delete(`${path}/${id}`);
}

export async function upsertAttendance(body) {
  const res = await apiClient.post("/attendance", body);
  return unwrap(res)?.item;
}

export async function fetchDashboardStats() {
  const res = await apiClient.get("/dashboard/stats");
  return unwrap(res);
}

export async function fetchSalary(employeeId, year, month) {
  const res = await apiClient.get(`/salary/${employeeId}`, { params: { year, month } });
  return unwrap(res);
}

export async function lookupEmployee(employeeId) {
  const res = await apiClient.get(`/employees/lookup/${employeeId}`);
  return unwrap(res)?.item;
}

export async function uploadFile(file, type = "image") {
  const form = new FormData();
  form.append("file", file);
  const res = await apiClient.post(`/uploads/${type}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return unwrap(res);
}
