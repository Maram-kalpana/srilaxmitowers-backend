import { sendSuccess } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export function makeCrudController(service, labels) {
  return {
    list: asyncHandler(async (req, res) => {
      const data = await service.list(req.query);
      return sendSuccess(res, `${labels.plural} fetched successfully`, data);
    }),
    getAll: asyncHandler(async (req, res) => {
      const items = await service.getAll(req.query);
      return sendSuccess(res, `${labels.plural} fetched successfully`, { items });
    }),
    getById: asyncHandler(async (req, res) => {
      const item = await service.getById(req.params.id);
      return sendSuccess(res, `${labels.singular} fetched successfully`, { item });
    }),
    create: asyncHandler(async (req, res) => {
      const item = await service.create(req.body);
      return sendSuccess(res, `${labels.singular} created successfully`, { item }, 201);
    }),
    update: asyncHandler(async (req, res) => {
      const item = await service.update(req.params.id, req.body);
      return sendSuccess(res, `${labels.singular} updated successfully`, { item });
    }),
    remove: asyncHandler(async (req, res) => {
      await service.remove(req.params.id);
      return sendSuccess(res, `${labels.singular} deleted successfully`);
    }),
  };
}
