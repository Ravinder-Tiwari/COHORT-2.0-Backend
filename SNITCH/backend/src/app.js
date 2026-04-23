import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRouter from "./routes/auth.routes.js";
import cors from "cors";
import passport from "passport"
import {Strategy as GoogleStrategy} from "passport-google-oauth20"
import { config } from "./config/config.js";

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(morgan("dev"))  
app.use(urlencoded({extended:true}))

app.use(cors({
    origin:"http://localhost:5173",
    methods:["GET","POST","PUT","DELETE"],
    credentials:true
},(accessToken,refreshToken,profile,done)=>{
    return done(null, profile)
}))

app.use(passport.initialize())

passport.use(new GoogleStrategy({
    clientID:config.GOOGLE_CLIENT_ID,
    clientSecret:config.GOOGLE_CLIENT_SECRET,
    callbackURL:"/api/auth/google/callback"
},(accessToken, refreshToken, profile, done) => {
  // Here, you would typically find or create a user in your database
  // For this example, we'll just return the profile
  return done(null, profile);
}))

app.use("/api/auth", authRouter)

export default app