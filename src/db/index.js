import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    // 1. Check if we already have a connection
    if (mongoose.connection.readyState >= 1) {
        return; // Already connected, don't do anything
    }

    try {
        // 2. Construct the URI safely
        // Ensure there isn't a double slash if your MONGODB_URI ends with /
        const connectionString = `${process.env.MONGODB_URI.replace(/\/$/, "")}/${DB_NAME}`;

        const connectionInstance = await mongoose.connect(connectionString);

        console.log(`\n✅ MongoDB connected! Host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("❌ MONGODB connection FAILED: ", error);
        // In local development, we want to crash. 
        // In Vercel, we throw the error so the handler can catch it.
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
        throw error;
    }
}

export default connectDB;