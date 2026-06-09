import expenseRepository from "../repositories/expense.repository.js";
import employeeRepository from "../repositories/employee.repository.js";
import ApiError from "../utils/ApiError.js";
import { mapExpense, parsePrefixedId } from "../utils/mappers.js";
import { paginatedResult } from "../utils/pagination.js";

const expenseService = {
  async list(query) {
    const filters = { ...query };
    if (query.employeeId) filters.employeeId = parsePrefixedId(query.employeeId);
    const { rows, total, page, limit } = await expenseRepository.findAll(filters);
    return paginatedResult(rows.map(mapExpense), total, page, limit);
  },

  async getAll() {
    const { rows } = await expenseRepository.findAll({ limit: 1000, page: 1 });
    return rows.map(mapExpense);
  },

  async getById(id) {
    const dbId = parsePrefixedId(id);
    const row = await expenseRepository.findById(dbId);
    if (!row) throw ApiError.notFound("Expense not found");
    return mapExpense(row);
  },

  async create(body) {
    const empDbId = parsePrefixedId(body.employeeId);
    const emp = await employeeRepository.findById(empDbId);
    if (!emp) throw ApiError.badRequest("Employee not found");

    const row = await expenseRepository.create({
      employee_id: empDbId,
      employee_name: emp.name,
      advance_type: body.advanceType,
      amount: body.amount,
      expense_date: body.date,
      note: body.note || null,
    });
    return mapExpense(row);
  },

  async update(id, body) {
    const dbId = parsePrefixedId(id);
    if (!(await expenseRepository.findById(dbId))) throw ApiError.notFound("Expense not found");

    const empDbId = parsePrefixedId(body.employeeId);
    const emp = await employeeRepository.findById(empDbId);
    if (!emp) throw ApiError.badRequest("Employee not found");

    const row = await expenseRepository.update(dbId, {
      employee_id: empDbId,
      employee_name: emp.name,
      advance_type: body.advanceType,
      amount: body.amount,
      expense_date: body.date,
      note: body.note || null,
    });
    return mapExpense(row);
  },

  async remove(id) {
    const dbId = parsePrefixedId(id);
    if (!(await expenseRepository.findById(dbId))) throw ApiError.notFound("Expense not found");
    await expenseRepository.softDelete(dbId);
    return true;
  },
};

export default expenseService;
