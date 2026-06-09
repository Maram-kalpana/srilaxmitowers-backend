import machineRepository from "../repositories/machine.repository.js";
import ApiError from "../utils/ApiError.js";
import { mapMachine, parsePrefixedId } from "../utils/mappers.js";
import { paginatedResult } from "../utils/pagination.js";

const machineService = {
  async list(query) {
    const { rows, total, page, limit } = await machineRepository.findAll(query);
    return paginatedResult(rows.map(mapMachine), total, page, limit);
  },

  async getAll(query = {}) {
    const { rows } = await machineRepository.findAll({ ...query, limit: 1000, page: 1 });
    return rows.map(mapMachine);
  },

  async getById(id) {
    const dbId = parsePrefixedId(id);
    const row = await machineRepository.findById(dbId);
    if (!row) throw ApiError.notFound("Machine record not found");
    return mapMachine(row);
  },

  async create(body) {
    const row = await machineRepository.create({
      entry_type: body.entryType,
      machine_name: body.machineName,
      serial_no: body.serialNo,
      model: body.model,
      project_id: parsePrefixedId(body.projectId),
      return_or_repair: body.returnOrRepair,
      record_date: body.date,
      handover_name: body.handoverName || null,
      handover_designation: body.handoverDesignation || null,
    });
    return mapMachine(row);
  },

  async update(id, body) {
    const dbId = parsePrefixedId(id);
    if (!(await machineRepository.findById(dbId))) {
      throw ApiError.notFound("Machine record not found");
    }
    const row = await machineRepository.update(dbId, {
      entry_type: body.entryType,
      machine_name: body.machineName,
      serial_no: body.serialNo,
      model: body.model,
      project_id: parsePrefixedId(body.projectId),
      return_or_repair: body.returnOrRepair,
      record_date: body.date,
      handover_name: body.handoverName || null,
      handover_designation: body.handoverDesignation || null,
    });
    return mapMachine(row);
  },

  async remove(id) {
    const dbId = parsePrefixedId(id);
    if (!(await machineRepository.findById(dbId))) throw ApiError.notFound("Machine record not found");
    await machineRepository.softDelete(dbId);
    return true;
  },
};

export default machineService;
