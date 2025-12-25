import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from './app.js';

dotenv.config(); // Vercel handles env vars automatically

// 1. REMOVED: fs.mkdirSync('./public/temp'). 
// Vercel does not allow writing to the local file system. 
// If you use Multer, point the destination to '/tmp' instead.

// 2. Connect to Database
// In Serverless, we connect top-level or inside the handler.
connectDB()
    .then(() => {
        console.log("MongoDB Connected");
    })
    .catch((err) => {
        console.error("MongoDB connection failed!", err);
    });

// 3. Export for Vercel
export default app;

// 4. Keep the listener ONLY for local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`🚀 Server running at: http://localhost:${process.env.PORT || 8000}`);
    });
}