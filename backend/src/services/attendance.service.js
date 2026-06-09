import attendanceRepository from "../repositories/attendance.repository.js";
import employeeRepository from "../repositories/employee.repository.js";
import ApiError from "../utils/ApiError.js";
import { mapAttendance } from "../utils/mappers.js";
import { paginatedResult } from "../utils/pagination.js";

const attendanceService = {
  async list(query) {
    const { rows, total, page, limit } = await attendanceRepository.findAll(query);
    return paginatedResult(rows.map(mapAttendance), total, page, limit);
  },

  async getAll(query = {}) {
    const { rows } = await attendanceRepository.findAll({ ...query, limit: 5000, page: 1 });
    return rows.map(mapAttendance);
  },

  async upsert({ employeeId, date, status }) {
    const emp = await employeeRepository.findByEmployeeId(String(employeeId).toUpperCase());
    if (!emp) throw ApiError.badRequest("Employee not found");

    const row = await attendanceRepository.upsert(
      emp.employee_id,
      date,
      status || null
    );
    return row ? mapAttendance(row) : null;
  },

  async bulkUpsert(records) {
    const results = [];
    for (const rec of records) {
      const mapped = await this.upsert(rec);
      if (mapped) results.push(mapped);
    }
    return results;
  },
};

export default attendanceService;
