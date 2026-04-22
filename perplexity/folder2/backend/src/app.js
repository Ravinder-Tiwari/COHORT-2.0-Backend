import express from "express";
import authRouter from "./routers/api.routes.js";
import cookieParser from "cookie-parser";
import { handleValidationErrors } from "./middleware/error.middleware.js";
const app = express()

app.use(express.json())
app.use(cookieParser())

app.use("/api/auth",authRouter)


app.use(handleValidationErrors)
export default app