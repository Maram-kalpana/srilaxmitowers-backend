import { query, queryOne } from "../config/db.js";
import { buildSearchClause, getPagination } from "../utils/pagination.js";

const NOT_DELETED = "deleted_at IS NULL";

const machineRepository = {
  async findAll(filters = {}) {
    const { page, limit, offset } = getPagination(filters);
    const { clause, params: searchParams } = buildSearchClause(filters.search, [
      "machine_name",
      "serial_no",
      "model",
    ]);

    let where = NOT_DELETED;
    const params = { ...searchParams, limit, offset };

    if (clause) where += ` AND ${clause}`;
    if (filters.entryType) {
      where += " AND entry_type = :entryType";
      params.entryType = filters.entryType;
    }
    if (filters.date) {
      where += " AND record_date = :date";
      params.date = filters.date;
    }

    const rows = await query(
      `SELECT * FROM machines WHERE ${where} ORDER BY record_date DESC LIMIT :limit OFFSET :offset`,
      params
    );
    const countRow = await queryOne(`SELECT COUNT(*) AS total FROM machines WHERE ${where}`, params);
    return { rows, total: countRow?.total ?? 0, page, limit };
  },

  async findById(id) {
    return queryOne(`SELECT * FROM machines WHERE id = :id AND ${NOT_DELETED}`, { id });
  },

  async create(data) {
    const result = await query(
      `INSERT INTO machines (entry_type, machine_name, serial_no, model, project_id,
        return_or_repair, record_date, handover_name, handover_designation)
       VALUES (:entry_type, :machine_name, :serial_no, :model, :project_id,
        :return_or_repair, :record_date, :handover_name, :handover_designation)`,
      data
    );
    return this.findById(result.insertId);
  },

  async update(id, data) {
    await query(
      `UPDATE machines SET entry_type=:entry_type, machine_name=:machine_name, serial_no=:serial_no,
       model=:model, project_id=:project_id, return_or_repair=:return_or_repair,
       record_date=:record_date, handover_name=:handover_name, handover_designation=:handover_designation
       WHERE id=:id AND ${NOT_DELETED}`,
      { ...data, id }
    );
    return this.findById(id);
  },

  async softDelete(id) {
    await query(`UPDATE machines SET deleted_at = NOW() WHERE id = :id`, { id });
  },

  async count() {
    const row = await queryOne(`SELECT COUNT(*) AS total FROM machines WHERE ${NOT_DELETED}`);
    return row?.total ?? 0;
  },
};

export default machineRepository;
