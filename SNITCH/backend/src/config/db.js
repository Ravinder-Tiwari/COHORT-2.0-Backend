import mongoose from "mongoose";
import { config } from "./config.js";

const connectToDb = async () => {
    await mongoose.connect(config.MONGO_URI)
    .then(()=>{
        console.log("Connected to MongoDB successfully.")
    })
}

export default connectToDb;