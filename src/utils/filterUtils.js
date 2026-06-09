export function matchesSearch(query, ...fields) {
  if (!query?.trim()) return true;
  const q = query.trim().toLowerCase();
  return fields.some((field) => String(field ?? "").toLowerCase().includes(q));
}

export function matchesDate(filterDate, ...recordDates) {
  if (!filterDate) return true;
  return recordDates.some((d) => d && String(d).startsWith(filterDate));
}
