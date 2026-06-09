import { query, queryOne } from "../config/db.js";
import { buildSearchClause, getPagination } from "../utils/pagination.js";

const NOT_DELETED = "deleted_at IS NULL";

const employeeRepository = {
  async findAll(filters = {}) {
    const { page, limit, offset } = getPagination(filters);
    const { clause, params: searchParams } = buildSearchClause(filters.search, [
      "e.name",
      "e.employee_id",
      "e.mobile",
      "e.email",
      "e.route",
    ]);

    let where = `e.${NOT_DELETED}`;
    const params = { ...searchParams, limit, offset };

    if (clause) where += ` AND ${clause}`;
    if (filters.date) {
      where += " AND (e.dob = :date OR e.training_start = :date OR e.training_end = :date)";
      params.date = filters.date;
    }

    const rows = await query(
      `SELECT e.* FROM employees e WHERE ${where} ORDER BY e.created_at DESC LIMIT :limit OFFSET :offset`,
      params
    );
    const countRow = await queryOne(
      `SELECT COUNT(*) AS total FROM employees e WHERE ${where}`,
      params
    );
    return { rows, total: countRow?.total ?? 0, page, limit };
  },

  async findById(id) {
    return queryOne(`SELECT * FROM employees WHERE id = :id AND ${NOT_DELETED}`, { id });
  },

  async findByEmployeeId(employeeId) {
    return queryOne(
      `SELECT * FROM employees WHERE employee_id = :employeeId AND ${NOT_DELETED}`,
      { employeeId }
    );
  },

  async create(data) {
    const result = await query(
      `INSERT INTO employees (name, employee_id, mobile, email, dob, designation, aadhar,
        monthly_salary, project_id, vehicle_id, route, training_start, training_end,
        pass_photo_url, aadhar_card_url)
       VALUES (:name, :employee_id, :mobile, :email, :dob, :designation, :aadhar,
        :monthly_salary, :project_id, :vehicle_id, :route, :training_start, :training_end,
        :pass_photo_url, :aadhar_card_url)`,
      data
    );
    return this.findById(result.insertId);
  },

  async update(id, data) {
    await query(
      `UPDATE employees SET name=:name, employee_id=:employee_id, mobile=:mobile, email=:email,
       dob=:dob, designation=:designation, aadhar=:aadhar, monthly_salary=:monthly_salary,
       project_id=:project_id, vehicle_id=:vehicle_id, route=:route,
       training_start=:training_start, training_end=:training_end,
       pass_photo_url=:pass_photo_url, aadhar_card_url=:aadhar_card_url
       WHERE id=:id AND ${NOT_DELETED}`,
      { ...data, id }
    );
    return this.findById(id);
  },

  async softDelete(id) {
    await query(`UPDATE employees SET deleted_at = NOW() WHERE id = :id`, { id });
  },

  async count() {
    const row = await queryOne(`SELECT COUNT(*) AS total FROM employees WHERE ${NOT_DELETED}`);
    return row?.total ?? 0;
  },
};

export default employeeRepository;
