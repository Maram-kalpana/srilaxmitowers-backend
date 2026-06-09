import { query, queryOne } from "../config/db.js";
import { buildSearchClause, getPagination } from "../utils/pagination.js";

const NOT_DELETED = "deleted_at IS NULL";

const vehicleRepository = {
  async findAll(filters = {}) {
    const { page, limit, offset } = getPagination(filters);
    const { clause, params: searchParams } = buildSearchClause(filters.search, [
      "vehicle_name",
    ]);

    let where = NOT_DELETED;
    const params = { ...searchParams, limit, offset };

    if (clause) where += ` AND ${clause}`;
    if (filters.date) {
      where +=
        " AND (insurance_date = :date OR road_tax_expiry_date = :date OR total_permit_expiry_date = :date)";
      params.date = filters.date;
    }

    const rows = await query(
      `SELECT * FROM vehicles WHERE ${where} ORDER BY created_at DESC LIMIT :limit OFFSET :offset`,
      params
    );
    const countRow = await queryOne(`SELECT COUNT(*) AS total FROM vehicles WHERE ${where}`, params);
    return { rows, total: countRow?.total ?? 0, page, limit };
  },

  async findById(id) {
    return queryOne(`SELECT * FROM vehicles WHERE id = :id AND ${NOT_DELETED}`, { id });
  },

  async create(data) {
    const result = await query(
      `INSERT INTO vehicles (vehicle_name, insurance_date, road_tax_expiry_date, total_permit_expiry_date)
       VALUES (:vehicle_name, :insurance_date, :road_tax_expiry_date, :total_permit_expiry_date)`,
      data
    );
    return this.findById(result.insertId);
  },

  async update(id, data) {
    await query(
      `UPDATE vehicles SET vehicle_name=:vehicle_name, insurance_date=:insurance_date,
       road_tax_expiry_date=:road_tax_expiry_date, total_permit_expiry_date=:total_permit_expiry_date
       WHERE id=:id AND ${NOT_DELETED}`,
      { ...data, id }
    );
    return this.findById(id);
  },

  async softDelete(id) {
    await query(`UPDATE vehicles SET deleted_at = NOW() WHERE id = :id`, { id });
  },

  async count() {
    const row = await queryOne(`SELECT COUNT(*) AS total FROM vehicles WHERE ${NOT_DELETED}`);
    return row?.total ?? 0;
  },
};

export default vehicleRepository;
