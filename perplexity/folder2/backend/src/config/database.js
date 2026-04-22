import mongoose from "mongoose";
import dotenv from "dotenv"
dotenv.config()
export function connectToDb(){
     mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("connected to DB")
    })
}