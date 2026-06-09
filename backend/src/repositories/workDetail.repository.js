import { query, queryOne } from "../config/db.js";
import { buildSearchClause, getPagination } from "../utils/pagination.js";

const NOT_DELETED = "deleted_at IS NULL";

const workDetailRepository = {
  async findAll(filters = {}) {
    const { page, limit, offset } = getPagination(filters);
    const { clause, params: searchParams } = buildSearchClause(filters.search, [
      "name",
      "reason",
      "status",
    ]);

    let where = NOT_DELETED;
    const params = { ...searchParams, limit, offset };

    if (clause) where += ` AND ${clause}`;
    if (filters.date) {
      where += " AND work_date = :date";
      params.date = filters.date;
    }
    if (filters.status) {
      where += " AND status = :status";
      params.status = filters.status;
    }

    const rows = await query(
      `SELECT * FROM work_details WHERE ${where} ORDER BY work_date DESC LIMIT :limit OFFSET :offset`,
      params
    );
    const countRow = await queryOne(
      `SELECT COUNT(*) AS total FROM work_details WHERE ${where}`,
      params
    );
    return { rows, total: countRow?.total ?? 0, page, limit };
  },

  async findById(id) {
    return queryOne(`SELECT * FROM work_details WHERE id = :id AND ${NOT_DELETED}`, { id });
  },

  async create(data) {
    const result = await query(
      `INSERT INTO work_details (work_date, name, reason, status)
       VALUES (:work_date, :name, :reason, :status)`,
      data
    );
    return this.findById(result.insertId);
  },

  async update(id, data) {
    await query(
      `UPDATE work_details SET work_date=:work_date, name=:name, reason=:reason, status=:status
       WHERE id=:id AND ${NOT_DELETED}`,
      { ...data, id }
    );
    return this.findById(id);
  },

  async softDelete(id) {
    await query(`UPDATE work_details SET deleted_at = NOW() WHERE id = :id`, { id });
  },

  async count() {
    const row = await queryOne(`SELECT COUNT(*) AS total FROM work_details WHERE ${NOT_DELETED}`);
    return row?.total ?? 0;
  },

  async countByStatus() {
    return query(
      `SELECT status, COUNT(*) AS count FROM work_details WHERE ${NOT_DELETED} GROUP BY status`
    );
  },
};

export default workDetailRepository;
