import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
} from "../validations/auth.validation.js";

const router = Router();

router.post("/register", registerValidation, validate, authController.register);
router.post("/login", loginValidation, validate, authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refresh);
router.get("/me", authenticate, authController.me);
router.post("/forgot-password", forgotPasswordValidation, validate, authController.forgotPassword);
router.post("/reset-password", resetPasswordValidation, validate, authController.resetPassword);
router.post("/change-password", authenticate, changePasswordValidation, validate, authController.changePassword);

export default router;
