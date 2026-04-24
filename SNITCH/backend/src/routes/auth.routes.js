import { Router } from "express";
import { validateLogin, validateRegistration } from "../validator/auth.validator.js";
import { googleCallback, registerUser } from "../controllers/auth.controller.js";
import { loginUser } from "../controllers/auth.controller.js";
import passport from "passport";
import { config } from "../config/config.js";
const authRouter = Router()

authRouter.post("/register",validateRegistration,registerUser)
authRouter.post("/login",validateLogin,loginUser  )

authRouter.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

authRouter.get('/google/callback',
  passport.authenticate('google', { session: false,failureRedirect:config.NODE_ENV? "http://localhost:5173/login":"/login" }),googleCallback
);

export default authRouter