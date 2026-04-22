import { Router } from "express";
import { validateLogin, validateRegistration } from "../validator/auth.validator.js";
import { registerUser } from "../controllers/auth.controller.js";
import { loginUser } from "../controllers/auth.controller.js";
const authRouter = Router()

authRouter.post("/register",validateRegistration,registerUser)
authRouter.post("/login",validateLogin,loginUser  )

export default authRouter