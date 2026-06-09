import { query, queryOne } from "../config/db.js";
import { buildSearchClause, getPagination } from "../utils/pagination.js";

const NOT_DELETED = "deleted_at IS NULL";

const attendanceRepository = {
  async findAll(filters = {}) {
    const { page, limit, offset } = getPagination(filters);
    const { clause, params: searchParams } = buildSearchClause(filters.search, [
      "employee_id",
    ]);

    let where = NOT_DELETED;
    const params = { ...searchParams, limit, offset };

    if (clause) where += ` AND ${clause}`;
    if (filters.date) {
      where += " AND attendance_date = :date";
      params.date = filters.date;
    }
    if (filters.employeeId) {
      where += " AND employee_id = :employeeId";
      params.employeeId = filters.employeeId;
    }

    const rows = await query(
      `SELECT * FROM attendance WHERE ${where} ORDER BY attendance_date DESC LIMIT :limit OFFSET :offset`,
      params
    );
    const countRow = await queryOne(
      `SELECT COUNT(*) AS total FROM attendance WHERE ${where}`,
      params
    );
    return { rows, total: countRow?.total ?? 0, page, limit };
  },

  async findByEmployeeAndDate(employeeId, date) {
    return queryOne(
      `SELECT * FROM attendance WHERE employee_id = :employeeId AND attendance_date = :date AND ${NOT_DELETED}`,
      { employeeId, date }
    );
  },

  async upsert(employeeId, date, status) {
    const existing = await this.findByEmployeeAndDate(employeeId, date);
    if (!status) {
      if (existing) {
        await query(`UPDATE attendance SET deleted_at = NOW() WHERE id = :id`, {
          id: existing.id,
        });
      }
      return null;
    }
    if (existing) {
      await query(`UPDATE attendance SET status = :status, deleted_at = NULL WHERE id = :id`, {
        id: existing.id,
        status,
      });
      return this.findByEmployeeAndDate(employeeId, date);
    }
    await query(
      `INSERT INTO attendance (employee_id, attendance_date, status) VALUES (:employeeId, :date, :status)`,
      { employeeId, date, status }
    );
    return this.findByEmployeeAndDate(employeeId, date);
  },

  async getMonthSummary(employeeId, year, month) {
    const monthKey = `${year}-${String(month).padStart(2, "0")}`;
    const rows = await query(
      `SELECT status, attendance_date FROM attendance
       WHERE employee_id = :employeeId AND deleted_at IS NULL
       AND DATE_FORMAT(attendance_date, '%Y-%m') = :monthKey`,
      { employeeId, monthKey }
    );
    const presentDates = rows.filter((r) => r.status === "present").map((r) => r.attendance_date);
    const absentDates = rows.filter((r) => r.status === "absent").map((r) => r.attendance_date);
    return {
      present: presentDates.length,
      absent: absentDates.length,
      presentDates,
      absentDates,
    };
  },

  async count() {
    const row = await queryOne(`SELECT COUNT(*) AS total FROM attendance WHERE ${NOT_DELETED}`);
    return row?.total ?? 0;
  },
};

export default attendanceRepository;
