import projectRepository from "../repositories/project.repository.js";
import employeeRepository from "../repositories/employee.repository.js";
import ApiError from "../utils/ApiError.js";
import { mapProject, parsePrefixedId } from "../utils/mappers.js";
import { paginatedResult } from "../utils/pagination.js";

const projectService = {
  async list(query) {
    const { rows, total, page, limit } = await projectRepository.findAll(query);
    return paginatedResult(rows.map(mapProject), total, page, limit);
  },

  async getAll() {
    const { rows } = await projectRepository.findAll({ limit: 1000, page: 1 });
    return rows.map(mapProject);
  },

  async getById(id) {
    const dbId = parsePrefixedId(id);
    const row = await projectRepository.findById(dbId);
    if (!row) throw ApiError.notFound("Project not found");
    return mapProject(row);
  },

  async create(body) {
    const managerDbId = parsePrefixedId(body.managerId);
    let managerName = body.managerName || "";
    if (managerDbId) {
      const mgr = await employeeRepository.findById(managerDbId);
      managerName = mgr?.name || managerName;
    }
    const row = await projectRepository.create({
      name: body.name,
      company_name: body.companyName,
      location: body.location,
      start_date: body.startDate,
      manager_id: managerDbId,
      manager_name: managerName,
    });
    return mapProject(row);
  },

  async update(id, body) {
    const dbId = parsePrefixedId(id);
    const existing = await projectRepository.findById(dbId);
    if (!existing) throw ApiError.notFound("Project not found");

    const managerDbId = parsePrefixedId(body.managerId);
    let managerName = body.managerName || existing.manager_name || "";
    if (managerDbId) {
      const mgr = await employeeRepository.findById(managerDbId);
      managerName = mgr?.name || managerName;
    }

    const row = await projectRepository.update(dbId, {
      name: body.name,
      company_name: body.companyName,
      location: body.location,
      start_date: body.startDate,
      manager_id: managerDbId,
      manager_name: managerName,
    });
    return mapProject(row);
  },

  async remove(id) {
    const dbId = parsePrefixedId(id);
    const existing = await projectRepository.findById(dbId);
    if (!existing) throw ApiError.notFound("Project not found");
    await projectRepository.softDelete(dbId);
    return true;
  },
};

export default projectService;
