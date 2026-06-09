import { Router } from "express";
import * as employeeController from "../controllers/employee.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParam, listQuery, employeeBody } from "../validations/common.validation.js";

const router = Router();

router.get("/lookup/:employeeId", employeeController.lookupByEmployeeId);

router.use(authenticate, authorize("admin", "employee"));

router.get("/", listQuery, validate, employeeController.list);
router.get("/all", employeeController.getAll);
router.get("/:id", idParam, validate, employeeController.getById);
router.post("/", employeeBody, validate, employeeController.create);
router.put("/:id", [...idParam, ...employeeBody], validate, employeeController.update);
router.delete("/:id", idParam, validate, employeeController.remove);

export default router;
