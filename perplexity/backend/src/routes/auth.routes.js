import { Router } from "express";
import { registerUser, loginUser, verifyEmail, getMe, logoutUser } from "../controllers/auth.controller.js";
import { registerValidation, loginValidation } from "../validators/auth.validators.js";
import { authUser } from "../middleware/auth.middleware.js";


const authRouter = Router();

authRouter.post("/register",registerValidation, registerUser);
authRouter.post("/login", loginValidation, loginUser);
authRouter.get("/verify-email", verifyEmail);
authRouter.get("/get-me",authUser, getMe);
authRouter.post("/logout",logoutUser)

export default authRouter;