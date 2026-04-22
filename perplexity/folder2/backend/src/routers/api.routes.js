import { Router } from "express";
import { registerValidation,loginValidation } from "../validators/auth.validator.js";
import { loginUser, registerUser, resendVerificationEmail, verifyEmail } from "../controllers/auth.controller.js";

const router = Router()


router.post("/register",registerValidation,registerUser)
router.get("/verify-email",verifyEmail)
router.post("/resend-verify-email",resendVerificationEmail)
router.post("/login",loginValidation,loginUser)

export default router