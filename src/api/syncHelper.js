import * as erpApi from "./erpApi.js";

const RESOURCE_MAP = {
  projects: "projects",
  employees: "employees",
  vehicles: "vehicles",
  machines: "machines",
  expenses: "expenses",
  workDetails: "workDetails",
};

function isTempId(id) {
  const n = String(id).split("-").pop();
  return n && n.length >= 10;
}

export async function syncCollection(resource, prev, next) {
  const apiKey = RESOURCE_MAP[resource];
  if (!apiKey) return next;

  const prevMap = new Map(prev.map((i) => [i.id, i]));
  const nextMap = new Map(next.map((i) => [i.id, i]));

  let result = [...next];
  const errors = [];

  for (const item of prev) {
    if (!nextMap.has(item.id) && !isTempId(item.id)) {
      try {
        await erpApi.deleteItem(apiKey, item.id);
      } catch (e) {
        console.error(`Delete ${resource} failed`, e);
        errors.push(`Delete ${resource} ${item.id}: ${e?.message || e}`);
      }
    }
  }

  for (const item of next) {
    if (!prevMap.has(item.id)) {
      try {
        const created = await erpApi.createItem(apiKey, item);
        if (created?.id) {
          result = result.map((r) => (r.id === item.id ? created : r));
        }
      } catch (e) {
        console.error(`Create ${resource} failed`, e);
        errors.push(`Create ${resource} ${item.id}: ${e?.message || e}`);
      }
    } else if (JSON.stringify(prevMap.get(item.id)) !== JSON.stringify(item) && !isTempId(item.id)) {
      try {
        const updated = await erpApi.updateItem(apiKey, item.id, item);
        if (updated?.id) {
          result = result.map((r) => (r.id === item.id ? updated : r));
        }
      } catch (e) {
        console.error(`Update ${resource} failed`, e);
        errors.push(`Update ${resource} ${item.id}: ${e?.message || e}`);
      }
    } else if (isTempId(item.id)) {
      try {
        const created = await erpApi.createItem(apiKey, item);
        if (created?.id) {
          result = result.map((r) => (r.id === item.id ? created : r));
        }
      } catch (e) {
        console.error(`Create ${resource} failed`, e);
        errors.push(`Create ${resource} ${item.id}: ${e?.message || e}`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join("; "));
  }

  return result;
}

export async function syncAttendance(prev, next) {
  const prevMap = new Map(prev.map((r) => [`${r.employeeId}-${r.date}`, r]));
  for (const rec of next) {
    const key = `${rec.employeeId}-${rec.date}`;
    const old = prevMap.get(key);
    if (!old || old.status !== rec.status) {
      try {
        await erpApi.upsertAttendance({
          employeeId: rec.employeeId,
          date: rec.date,
          status: rec.status,
        });
      } catch (e) {
        console.error("Attendance sync failed", e);
      }
    }
  }
  for (const rec of prev) {
    const key = `${rec.employeeId}-${rec.date}`;
    if (!next.find((n) => `${n.employeeId}-${n.date}` === key)) {
      try {
        await erpApi.upsertAttendance({
          employeeId: rec.employeeId,
          date: rec.date,
          status: null,
        });
      } catch (e) {
        console.error("Attendance clear failed", e);
      }
    }
  }
}
