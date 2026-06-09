import employeeRepository from "../repositories/employee.repository.js";
import salaryService from "../services/salary.service.js";
import ApiError from "../utils/ApiError.js";
import { mapEmployee, parsePrefixedId } from "../utils/mappers.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getSalary = asyncHandler(async (req, res) => {
  const dbId = parsePrefixedId(req.params.employeeId);
  const employee = await employeeRepository.findById(dbId);
  if (!employee) throw ApiError.notFound("Employee not found");

  const year = parseInt(req.query.year, 10) || new Date().getFullYear();
  const month = parseInt(req.query.month, 10) || new Date().getMonth() + 1;

  const breakdown = await salaryService.calculate(employee, year, month);
  return sendSuccess(res, "Salary calculated successfully", {
    employee: mapEmployee(employee),
    year,
    month,
    breakdown,
  });
});
