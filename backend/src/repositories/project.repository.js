import { query, queryOne } from "../config/db.js";
import { buildSearchClause, getPagination } from "../utils/pagination.js";

const NOT_DELETED = "deleted_at IS NULL";

const projectRepository = {
  async findAll(filters = {}) {
    const { page, limit, offset } = getPagination(filters);
    const { clause, params: searchParams } = buildSearchClause(filters.search, [
      "p.name",
      "p.company_name",
      "p.location",
      "p.manager_name",
    ]);

    let where = NOT_DELETED;
    const params = { ...searchParams, limit, offset };

    if (clause) where += ` AND ${clause}`;
    if (filters.date) {
      where += " AND p.start_date = :date";
      params.date = filters.date;
    }

    const rows = await query(
      `SELECT p.* FROM projects p WHERE ${where} ORDER BY p.created_at DESC LIMIT :limit OFFSET :offset`,
      params
    );
    const countRow = await queryOne(
      `SELECT COUNT(*) AS total FROM projects p WHERE ${where}`,
      params
    );
    return { rows, total: countRow?.total ?? 0, page, limit };
  },

  async findById(id) {
    return queryOne(`SELECT * FROM projects WHERE id = :id AND ${NOT_DELETED}`, { id });
  },

  async create(data) {
    const result = await query(
      `INSERT INTO projects (name, company_name, location, start_date, manager_id, manager_name)
       VALUES (:name, :company_name, :location, :start_date, :manager_id, :manager_name)`,
      data
    );
    return this.findById(result.insertId);
  },

  async update(id, data) {
    await query(
      `UPDATE projects SET name=:name, company_name=:company_name, location=:location,
       start_date=:start_date, manager_id=:manager_id, manager_name=:manager_name
       WHERE id=:id AND ${NOT_DELETED}`,
      { ...data, id }
    );
    return this.findById(id);
  },

  async softDelete(id) {
    await query(`UPDATE projects SET deleted_at = NOW() WHERE id = :id`, { id });
  },

  async count() {
    const row = await queryOne(`SELECT COUNT(*) AS total FROM projects WHERE ${NOT_DELETED}`);
    return row?.total ?? 0;
  },
};

export default projectRepository;
