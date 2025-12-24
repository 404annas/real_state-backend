import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from './app.js';
import fs from 'fs';

dotenv.config({ path: './.env' });

// Ensure temp directory exists for uploads
const dir = './public/temp';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`🚀 Server running at: http://localhost:${process.env.PORT || 8000}`);
    });
})
.catch((err) => {
    console.log("MongoDB connection failed!", err);
});