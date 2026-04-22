import mongoose from "mongoose";

export async function connectToDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    console.error("Please ensure MongoDB is running or check your MONGO_URI");
    // Don't exit in development, let the app start
    // process.exit(1);
  }
}