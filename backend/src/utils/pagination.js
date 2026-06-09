export function getPagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export function paginatedResult(rows, total, page, limit) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    items: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

export function buildSearchClause(search, fields) {
  if (!search?.trim()) return { clause: "", params: {} };
  const q = `%${search.trim()}%`;
  const parts = fields.map((f, i) => `${f} LIKE :search${i}`);
  const params = {};
  fields.forEach((_, i) => {
    params[`search${i}`] = q;
  });
  return { clause: `(${parts.join(" OR ")})`, params };
}
