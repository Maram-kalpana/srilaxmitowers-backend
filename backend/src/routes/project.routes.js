import { Router } from "express";
import projectService from "../services/project.service.js";
import { makeCrudController } from "../controllers/crud.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParam, listQuery, projectBody } from "../validations/common.validation.js";

const c = makeCrudController(projectService, { singular: "Project", plural: "Projects" });
const router = Router();

router.use(authenticate, authorize("admin", "employee"));

router.get("/", listQuery, validate, c.list);
router.get("/all", c.getAll);
router.get("/:id", idParam, validate, c.getById);
router.post("/", projectBody, validate, c.create);
router.put("/:id", [...idParam, ...projectBody], validate, c.update);
router.delete("/:id", idParam, validate, c.remove);

export default router;
