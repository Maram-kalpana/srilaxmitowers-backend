import employeeRepository from "../repositories/employee.repository.js";
import ApiError from "../utils/ApiError.js";
import { mapEmployee, parsePrefixedId } from "../utils/mappers.js";
import { paginatedResult } from "../utils/pagination.js";

function toDbPayload(body) {
  return {
    name: body.name,
    employee_id: String(body.employeeId).toUpperCase(),
    mobile: body.mobile,
    email: body.email || null,
    dob: body.dob || null,
    designation: body.designation || null,
    aadhar: body.aadhar?.replace(/\s/g, "") || null,
    monthly_salary: Number(body.monthlySalary) || 0,
    project_id: parsePrefixedId(body.projectId),
    vehicle_id: parsePrefixedId(body.vehicleId),
    route: body.route || null,
    training_start: body.trainingDurationStart || null,
    training_end: body.trainingDurationEnd || null,
    pass_photo_url: body.passPhotoUrl || body.passPhoto || null,
    aadhar_card_url: body.aadharCardUrl || body.aadharCardImage || null,
  };
}

const employeeService = {
  async list(query) {
    const { rows, total, page, limit } = await employeeRepository.findAll(query);
    return paginatedResult(rows.map(mapEmployee), total, page, limit);
  },

  async getAll() {
    const { rows } = await employeeRepository.findAll({ limit: 1000, page: 1 });
    return rows.map(mapEmployee);
  },

  async getById(id) {
    const dbId = parsePrefixedId(id);
    const row = await employeeRepository.findById(dbId);
    if (!row) throw ApiError.notFound("Employee not found");
    return mapEmployee(row);
  },

  async getByEmployeeId(employeeId) {
    const row = await employeeRepository.findByEmployeeId(String(employeeId).toUpperCase());
    if (!row) throw ApiError.notFound("Employee not found");
    return mapEmployee(row);
  },

  async create(body) {
    const dup = await employeeRepository.findByEmployeeId(body.employeeId);
    if (dup) throw ApiError.conflict("Employee ID already exists");
    const row = await employeeRepository.create(toDbPayload(body));
    return mapEmployee(row);
  },

  async update(id, body) {
    const dbId = parsePrefixedId(id);
    const existing = await employeeRepository.findById(dbId);
    if (!existing) throw ApiError.notFound("Employee not found");

    const dup = await employeeRepository.findByEmployeeId(body.employeeId);
    if (dup && dup.id !== dbId) throw ApiError.conflict("Employee ID already exists");

    const row = await employeeRepository.update(dbId, toDbPayload(body));
    return mapEmployee(row);
  },

  async remove(id) {
    const dbId = parsePrefixedId(id);
    const existing = await employeeRepository.findById(dbId);
    if (!existing) throw ApiError.notFound("Employee not found");
    await employeeRepository.softDelete(dbId);
    return true;
  },
};

export default employeeService;
