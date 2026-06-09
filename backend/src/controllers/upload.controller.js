import uploadService from "../services/upload.service.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest("Image file required");
  const data = await uploadService.saveFile(req.file, "image", req.user?.id);
  return sendSuccess(res, "Image uploaded successfully", data, 201);
});

export const uploadPdf = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest("PDF file required");
  const data = await uploadService.saveFile(req.file, "pdf", req.user?.id);
  return sendSuccess(res, "PDF uploaded successfully", data, 201);
});

export const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest("Document file required");
  const data = await uploadService.saveFile(req.file, "document", req.user?.id);
  return sendSuccess(res, "Document uploaded successfully", data, 201);
});
