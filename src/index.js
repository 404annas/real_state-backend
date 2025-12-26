import dotenv from "dotenv";
import connectDB from "./db/index.js"; // FIXED: Removed /src/ because we are already in src
import { app } from './app.js';

dotenv.config();

// 1. Local Development Logic
if (process.env.NODE_ENV !== 'production') {
    connectDB()
        .then(() => {
            const port = process.env.PORT || 8001;
            app.listen(port, () => {
                console.log(`🚀 Server running at: http://localhost:${port}`);
            });
        })
        .catch((err) => {
            console.error("MongoDB connection failed!", err);
        });
}

// 2. Vercel Serverless Handler Logic
export default async (req, res) => {
    try {
        await connectDB();
        return app(req, res);
    } catch (err) {
        console.error("Vercel Handler Error:", err);
        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: err.message
        });
    }
};