import { Router } from "express";
import workDetailService from "../services/workDetail.service.js";
import { makeCrudController } from "../controllers/crud.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParam, listQuery, workDetailBody } from "../validations/common.validation.js";

const c = makeCrudController(workDetailService, { singular: "Work detail", plural: "Work details" });
const router = Router();

router.use(authenticate, authorize("admin", "employee"));

router.get("/", listQuery, validate, c.list);
router.get("/all", c.getAll);
router.get("/:id", idParam, validate, c.getById);
router.post("/", workDetailBody, validate, c.create);
router.put("/:id", [...idParam, ...workDetailBody], validate, c.update);
router.delete("/:id", idParam, validate, c.remove);

export default router;
