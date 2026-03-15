import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        console.log(`📍 Connection URI: ${uri}`);
        console.log("⏳ Connecting to MongoDB...");
        
        const connectionInstance = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 5000,
        });
        
        console.log(`\n✅ MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("❌ MONGODB connection FAILED");
        console.log("Error message:", error.message);
        console.log("Error code:", error.code);
        console.log("Full error:", error);
        process.exit(1)
    }
}

export default connectDB