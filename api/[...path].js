import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRouter from '../../src/routes/user.routes.js';
import propertyRouter from '../../src/routes/property.routes.js';
import inquiryRouter from '../../src/routes/inquiry.routes.js';

// Create a standalone express app for Vercel
const app = express();

// Configure CORS for Vercel deployment
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : ["http://localhost:3000", "http://localhost:3001", "http://localhost:3004", "https://realstates2.netlify.app", "https://real-state-frontend-khaki.vercel.app"],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Routes - match the exact routes from your main app
app.use("/api/v1/users", userRouter);
app.use("/api/v1/properties", propertyRouter);
app.use("/api/v1/inquiries", inquiryRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || []
  });
});

// Vercel serverless function handler
export default async function handler(req, res) {
  // Use the express app to handle the request
  app(req, res);
}

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
};