import { Router } from "express";
import machineService from "../services/machine.service.js";
import { makeCrudController } from "../controllers/crud.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParam, listQuery, machineBody } from "../validations/common.validation.js";

const c = makeCrudController(machineService, { singular: "Machine", plural: "Machines" });
const router = Router();

router.use(authenticate, authorize("admin", "employee"));

router.get("/", listQuery, validate, c.list);
router.get("/all", c.getAll);
router.get("/:id", idParam, validate, c.getById);
router.post("/", machineBody, validate, c.create);
router.put("/:id", [...idParam, ...machineBody], validate, c.update);
router.delete("/:id", idParam, validate, c.remove);

export default router;
