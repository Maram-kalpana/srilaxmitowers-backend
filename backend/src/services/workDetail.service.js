import workDetailRepository from "../repositories/workDetail.repository.js";
import ApiError from "../utils/ApiError.js";
import { mapWorkDetail, parsePrefixedId } from "../utils/mappers.js";
import { paginatedResult } from "../utils/pagination.js";

const workDetailService = {
  async list(query) {
    const { rows, total, page, limit } = await workDetailRepository.findAll(query);
    return paginatedResult(rows.map(mapWorkDetail), total, page, limit);
  },

  async getAll() {
    const { rows } = await workDetailRepository.findAll({ limit: 1000, page: 1 });
    return rows.map(mapWorkDetail);
  },

  async getById(id) {
    const dbId = parsePrefixedId(id);
    const row = await workDetailRepository.findById(dbId);
    if (!row) throw ApiError.notFound("Work detail not found");
    return mapWorkDetail(row);
  },

  async create(body) {
    const row = await workDetailRepository.create({
      work_date: body.date,
      name: body.name,
      reason: body.reason,
      status: body.status || "Pending",
    });
    return mapWorkDetail(row);
  },

  async update(id, body) {
    const dbId = parsePrefixedId(id);
    if (!(await workDetailRepository.findById(dbId))) {
      throw ApiError.notFound("Work detail not found");
    }
    const row = await workDetailRepository.update(dbId, {
      work_date: body.date,
      name: body.name,
      reason: body.reason,
      status: body.status,
    });
    return mapWorkDetail(row);
  },

  async remove(id) {
    const dbId = parsePrefixedId(id);
    if (!(await workDetailRepository.findById(dbId))) throw ApiError.notFound("Work detail not found");
    await workDetailRepository.softDelete(dbId);
    return true;
  },
};

export default workDetailService;
