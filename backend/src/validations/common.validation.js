import { body, param, query } from "express-validator";

export const idParam = [param("id").notEmpty().withMessage("ID is required")];

export const listQuery = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("search").optional().isString(),
  query("date").optional().isISO8601().toDate(),
];

export const projectBody = [
  body("name").trim().notEmpty(),
  body("companyName").trim().notEmpty(),
  body("location").trim().notEmpty(),
  body("startDate").isISO8601().toDate(),
  body("managerId").optional().isString(),
];

export const employeeBody = [
  body("name").trim().notEmpty(),
  body("employeeId").trim().notEmpty(),
  body("mobile").isLength({ min: 10, max: 15 }).withMessage("Valid mobile required"),
  body("email").optional({ values: "falsy" }).isEmail(),
  body("aadhar").optional().isLength({ min: 12, max: 12 }),
  body("monthlySalary").notEmpty(),
];

export const vehicleBody = [
  body("vehicleName").trim().notEmpty(),
  body("insuranceDate").isISO8601().toDate(),
  body("roadTaxExpiryDate").isISO8601().toDate(),
  body("totalPermitExpiryDate").isISO8601().toDate(),
];

export const machineBody = [
  body("entryType").isIn(["in", "out"]),
  body("machineName").trim().notEmpty(),
  body("serialNo").trim().notEmpty(),
  body("model").trim().notEmpty(),
  body("returnOrRepair").isIn(["return", "repair"]),
  body("date").isISO8601().toDate(),
];

export const expenseBody = [
  body("employeeId").notEmpty(),
  body("advanceType").isIn(["petrol", "ta-da", "others"]),
  body("amount").isFloat({ min: 0 }),
  body("date").isISO8601().toDate(),
];

export const workDetailBody = [
  body("date").isISO8601().toDate(),
  body("name").trim().notEmpty(),
  body("reason").trim().notEmpty(),
  body("status").isIn(["Pending", "In Progress", "Completed"]),
];

export const attendanceBody = [
  body("employeeId").notEmpty(),
  body("date").isISO8601().toDate(),
  body("status").optional().isIn(["present", "absent", null]),
];
