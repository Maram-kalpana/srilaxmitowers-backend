/** Initial demo data — persisted to localStorage after first load */

export const seedProjectId = "p-seed-1";
export const seedManagerUserId = "u-seed-1";

export function getDefaultProjects() {
  return [
    {
      id: seedProjectId,
      name: "Project Alpha",
      location: "Hyderabad",
      startDate: "2026-01-15",
      managerId: seedManagerUserId,
    },
  ];
}

export function getDefaultUsers() {
  return [
    {
      id: seedManagerUserId,
      name: "Site Manager",
      phone: "9000000000",
      salary: "45000",
    },
  ];
}

export function getDefaultWorkDetails() {
  return [
    {
      id: "wd-seed-1",
      date: "2026-01-20",
      name: "Foundation work",
      status: "In Progress",
    },
  ];
}

export function emptyReports() {
  return {
    labour: [],
    machinery: [],
    materials: [],
    stock: [],
    details: [],
    accounts: [],
  };
}
