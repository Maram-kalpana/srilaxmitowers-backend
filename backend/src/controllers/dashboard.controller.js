import dashboardService from "../services/dashboard.service.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getStats = asyncHandler(async (_req, res) => {
  const stats = await dashboardService.getStats();
  return sendSuccess(res, "Dashboard stats fetched successfully", stats);
});
