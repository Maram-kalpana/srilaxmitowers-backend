import attendanceService from "../services/attendance.service.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const list = asyncHandler(async (req, res) => {
  const data = await attendanceService.list(req.query);
  return sendSuccess(res, "Attendance fetched successfully", data);
});

export const getAll = asyncHandler(async (req, res) => {
  const items = await attendanceService.getAll(req.query);
  return sendSuccess(res, "Attendance fetched successfully", { items });
});

export const upsert = asyncHandler(async (req, res) => {
  const item = await attendanceService.upsert(req.body);
  return sendSuccess(res, "Attendance saved successfully", { item });
});

export const bulkUpsert = asyncHandler(async (req, res) => {
  const items = await attendanceService.bulkUpsert(req.body.records || []);
  return sendSuccess(res, "Attendance bulk saved", { items });
});
