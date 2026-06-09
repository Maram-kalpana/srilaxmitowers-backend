import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.use(authenticate, authorize("admin", "employee", "user"));

router.get("/stats", dashboardController.getStats);

export default router;
