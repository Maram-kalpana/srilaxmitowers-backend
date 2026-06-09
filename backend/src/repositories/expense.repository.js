import { query, queryOne } from "../config/db.js";
import { buildSearchClause, getPagination } from "../utils/pagination.js";

const NOT_DELETED = "deleted_at IS NULL";

const expenseRepository = {
  async findAll(filters = {}) {
    const { page, limit, offset } = getPagination(filters);
    const { clause, params: searchParams } = buildSearchClause(filters.search, [
      "employee_name",
      "advance_type",
      "note",
    ]);

    let where = NOT_DELETED;
    const params = { ...searchParams, limit, offset };

    if (clause) where += ` AND ${clause}`;
    if (filters.date) {
      where += " AND expense_date = :date";
      params.date = filters.date;
    }
    if (filters.employeeId) {
      where += " AND employee_id = :employeeId";
      params.employeeId = filters.employeeId;
    }

    const rows = await query(
      `SELECT * FROM expenses WHERE ${where} ORDER BY expense_date DESC LIMIT :limit OFFSET :offset`,
      params
    );
    const countRow = await queryOne(`SELECT COUNT(*) AS total FROM expenses WHERE ${where}`, params);
    return { rows, total: countRow?.total ?? 0, page, limit };
  },

  async findById(id) {
    return queryOne(`SELECT * FROM expenses WHERE id = :id AND ${NOT_DELETED}`, { id });
  },

  async create(data) {
    const result = await query(
      `INSERT INTO expenses (employee_id, employee_name, advance_type, amount, expense_date, note)
       VALUES (:employee_id, :employee_name, :advance_type, :amount, :expense_date, :note)`,
      data
    );
    return this.findById(result.insertId);
  },

  async update(id, data) {
    await query(
      `UPDATE expenses SET employee_id=:employee_id, employee_name=:employee_name,
       advance_type=:advance_type, amount=:amount, expense_date=:expense_date, note=:note
       WHERE id=:id AND ${NOT_DELETED}`,
      { ...data, id }
    );
    return this.findById(id);
  },

  async softDelete(id) {
    await query(`UPDATE expenses SET deleted_at = NOW() WHERE id = :id`, { id });
  },

  async getMonthTotal(employeeDbId, year, month) {
    const monthKey = `${year}-${String(month).padStart(2, "0")}`;
    const row = await queryOne(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM expenses
       WHERE employee_id = :employeeDbId AND deleted_at IS NULL
       AND DATE_FORMAT(expense_date, '%Y-%m') = :monthKey`,
      { employeeDbId, monthKey }
    );
    return Number(row?.total ?? 0);
  },

  async count() {
    const row = await queryOne(`SELECT COUNT(*) AS total FROM expenses WHERE ${NOT_DELETED}`);
    return row?.total ?? 0;
  },
};

export default expenseRepository;
