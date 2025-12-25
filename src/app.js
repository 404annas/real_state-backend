import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


const app = express();

// Configure CORS to allow specified origin or multiple origins
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : ["http://localhost:3000", "http://localhost:3001", "http://localhost:3004", "https://realstates2.netlify.app", "https://real-state-frontend-khaki.vercel.app"],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes
import userRouter from "./routes/user.routes.js";
import propertyRouter from "./routes/property.routes.js";
import inquiryRouter from "./routes/inquiry.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/properties", propertyRouter);
app.use("/api/v1/inquiries", inquiryRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || []
  });
});

app.get("/", (req, res) => {
  res.json({ message: "Backend is running successfully!" });
});

export { app };