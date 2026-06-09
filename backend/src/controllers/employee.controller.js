import employeeService from "../services/employee.service.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { makeCrudController } from "./crud.controller.js";

const crud = makeCrudController(employeeService, {
  singular: "Employee",
  plural: "Employees",
});

export const list = crud.list;
export const getAll = crud.getAll;
export const getById = crud.getById;
export const create = crud.create;
export const update = crud.update;
export const remove = crud.remove;

export const lookupByEmployeeId = asyncHandler(async (req, res) => {
  const item = await employeeService.getByEmployeeId(req.params.employeeId);
  return sendSuccess(res, "Employee fetched successfully", { item });
});
