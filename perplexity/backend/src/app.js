import express from "express"
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth.routes.js"
import { handleValidationErrors } from "./middleware/error.middleware.js"
import morgan from "morgan" 
import cors from "cors"
const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(morgan("dev"))
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
    methods:["GET","POST","PUT","DELETE"]   
}))
// Routes
app.use("/api/auth", authRouter);


app.use(handleValidationErrors)

//Health check URI
app.get("/",(req,res)=>{
    res.json({
        message:"server is running"
    })
})

export default app