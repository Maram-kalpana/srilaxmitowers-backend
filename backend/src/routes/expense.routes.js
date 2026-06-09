import { Router } from "express";
import expenseService from "../services/expense.service.js";
import { makeCrudController } from "../controllers/crud.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParam, listQuery, expenseBody } from "../validations/common.validation.js";

const c = makeCrudController(expenseService, { singular: "Expense", plural: "Expenses" });
const router = Router();

router.use(authenticate, authorize("admin", "employee"));

router.get("/", listQuery, validate, c.list);
router.get("/all", c.getAll);
router.get("/:id", idParam, validate, c.getById);
router.post("/", expenseBody, validate, c.create);
router.put("/:id", [...idParam, ...expenseBody], validate, c.update);
router.delete("/:id", idParam, validate, c.remove);

export default router;
