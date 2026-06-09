import { Router } from "express";
import authRoutes from "./auth.routes.js";
import projectRoutes from "./project.routes.js";
import employeeRoutes from "./employee.routes.js";
import vehicleRoutes from "./vehicle.routes.js";
import machineRoutes from "./machine.routes.js";
import expenseRoutes from "./expense.routes.js";
import workDetailRoutes from "./workDetail.routes.js";
import attendanceRoutes from "./attendance.routes.js";
import salaryRoutes from "./salary.routes.js";
import uploadRoutes from "./upload.routes.js";
import dashboardRoutes from "./dashboard.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ success: true, message: "Srilaxmi API is running" });
});

router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/projects", projectRoutes);
router.use("/employees", employeeRoutes);
router.use("/vehicles", vehicleRoutes);
router.use("/machines", machineRoutes);
router.use("/expenses", expenseRoutes);
router.use("/work-details", workDetailRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/salary", salaryRoutes);
router.use("/uploads", uploadRoutes);

export default router;
