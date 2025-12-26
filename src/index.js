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
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    const corsOrigin = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : ["http://localhost:3000", "http://localhost:3001", "http://localhost:3004", "https://realstates2.netlify.app", "https://real-state-frontend-khaki.vercel.app"];
    const requestOrigin = req.headers.origin;

    if (corsOrigin.includes(requestOrigin) || corsOrigin.includes('*')) {
      res.setHeader('Access-Control-Allow-Origin', requestOrigin || '*');
    } else {
      res.setHeader('Access-Control-Allow-Origin', corsOrigin[0]); // Default to first origin
    }

    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    res.status(200).end();
    return;
  }

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