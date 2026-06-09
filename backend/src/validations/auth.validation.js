import { body } from "express-validator";

export const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").optional().isEmail().withMessage("Valid email required"),
  body("phone").optional().isMobilePhone().withMessage("Valid mobile required"),
  body("password").isLength({ min: 6 }).withMessage("Password min 6 characters"),
  body("role").optional().isIn(["admin", "employee", "user"]),
];

export const loginValidation = [
  body("login").trim().notEmpty().withMessage("Login is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const forgotPasswordValidation = [
  body("email").isEmail().withMessage("Valid email required"),
];

export const resetPasswordValidation = [
  body("token").notEmpty().withMessage("Token is required"),
  body("password").isLength({ min: 6 }).withMessage("Password min 6 characters"),
];

export const changePasswordValidation = [
  body("oldPassword").notEmpty().withMessage("Current password required"),
  body("newPassword").isLength({ min: 6 }).withMessage("New password min 6 characters"),
];
