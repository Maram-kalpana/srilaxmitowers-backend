import ApiError from "../utils/ApiError.js";
import { sendError } from "../utils/ApiResponse.js";

export function notFoundHandler(req, res) {
  return sendError(res, `Route ${req.method} ${req.originalUrl} not found`, 404);
}

export function errorHandler(err, req, res, _next) {
  if (err instanceof ApiError) {
    return sendError(res, err.message, err.statusCode, err.errors);
  }

  if (err.name === "ValidationError") {
    return sendError(res, err.message, 400);
  }

  if (err.code === "ER_DUP_ENTRY") {
    return sendError(res, "Duplicate entry — record already exists", 409);
  }

  console.error("[API Error]", err);
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message || "Internal server error";
  return sendError(res, message, 500);
}
