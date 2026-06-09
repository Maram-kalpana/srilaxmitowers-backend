import vehicleRepository from "../repositories/vehicle.repository.js";
import ApiError from "../utils/ApiError.js";
import { mapVehicle, parsePrefixedId } from "../utils/mappers.js";
import { paginatedResult } from "../utils/pagination.js";

const vehicleService = {
  async list(query) {
    const { rows, total, page, limit } = await vehicleRepository.findAll(query);
    return paginatedResult(rows.map(mapVehicle), total, page, limit);
  },

  async getAll() {
    const { rows } = await vehicleRepository.findAll({ limit: 1000, page: 1 });
    return rows.map(mapVehicle);
  },

  async getById(id) {
    const dbId = parsePrefixedId(id);
    const row = await vehicleRepository.findById(dbId);
    if (!row) throw ApiError.notFound("Vehicle not found");
    return mapVehicle(row);
  },

  async create(body) {
    const row = await vehicleRepository.create({
      vehicle_name: body.vehicleName,
      insurance_date: body.insuranceDate,
      road_tax_expiry_date: body.roadTaxExpiryDate,
      total_permit_expiry_date: body.totalPermitExpiryDate,
    });
    return mapVehicle(row);
  },

  async update(id, body) {
    const dbId = parsePrefixedId(id);
    if (!(await vehicleRepository.findById(dbId))) throw ApiError.notFound("Vehicle not found");
    const row = await vehicleRepository.update(dbId, {
      vehicle_name: body.vehicleName,
      insurance_date: body.insuranceDate,
      road_tax_expiry_date: body.roadTaxExpiryDate,
      total_permit_expiry_date: body.totalPermitExpiryDate,
    });
    return mapVehicle(row);
  },

  async remove(id) {
    const dbId = parsePrefixedId(id);
    if (!(await vehicleRepository.findById(dbId))) throw ApiError.notFound("Vehicle not found");
    await vehicleRepository.softDelete(dbId);
    return true;
  },
};

export default vehicleService;
