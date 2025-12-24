import { Router } from "express";
import { submitInquiry, getInquiries, getInquiryById } from "../controllers/inquiry.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/submit", submitInquiry);

// Admin routes
router.get("/", verifyJWT, getInquiries);
router.get("/:id", verifyJWT, getInquiryById);

export default router;