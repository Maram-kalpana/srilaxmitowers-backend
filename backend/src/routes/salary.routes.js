import { Router } from "express";
import * as salaryController from "../controllers/salary.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.use(authenticate, authorize("admin", "employee"));

router.get("/:employeeId", salaryController.getSalary);

export default router;
