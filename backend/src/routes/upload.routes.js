import { Router } from "express";
import * as uploadController from "../controllers/upload.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { uploadImage, uploadPdf, uploadDocument } from "../middleware/upload.js";

const router = Router();

router.use(authenticate, authorize("admin", "employee"));

router.post("/image", uploadImage.single("file"), uploadController.uploadImage);
router.post("/pdf", uploadPdf.single("file"), uploadController.uploadPdf);
router.post("/document", uploadDocument.single("file"), uploadController.uploadDocument);

export default router;
