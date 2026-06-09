import { Router } from "express";
import * as attendanceController from "../controllers/attendance.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { listQuery, attendanceBody } from "../validations/common.validation.js";

const router = Router();

router.use(authenticate, authorize("admin", "employee"));

router.get("/", listQuery, validate, attendanceController.list);
router.get("/all", attendanceController.getAll);
router.post("/", attendanceBody, validate, attendanceController.upsert);
router.post("/bulk", attendanceController.bulkUpsert);

export default router;
