import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from './app.js';

dotenv.config();

// Connect to DB once at the top level
// Most MongoDB drivers will cache the connection
connectDB()
    .then(() => {
        console.log("MongoDB Connected");
    })
    .catch((err) => {
        console.error("MongoDB connection failed!", err);
    });

// IMPORTANT: Vercel needs the app exported as the default
export default app;

// Local development only
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 8000;
    app.listen(port, () => {
        console.log(`🚀 Server running at: http://localhost:${port}`);
    });
}