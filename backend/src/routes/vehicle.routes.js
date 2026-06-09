import { Router } from "express";
import vehicleService from "../services/vehicle.service.js";
import { makeCrudController } from "../controllers/crud.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParam, listQuery, vehicleBody } from "../validations/common.validation.js";

const c = makeCrudController(vehicleService, { singular: "Vehicle", plural: "Vehicles" });
const router = Router();

router.use(authenticate, authorize("admin", "employee"));

router.get("/", listQuery, validate, c.list);
router.get("/all", c.getAll);
router.get("/:id", idParam, validate, c.getById);
router.post("/", vehicleBody, validate, c.create);
router.put("/:id", [...idParam, ...vehicleBody], validate, c.update);
router.delete("/:id", idParam, validate, c.remove);

export default router;
