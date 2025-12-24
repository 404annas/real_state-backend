import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { createProperty, getAllProperties, getPropertyById, getAllPropertiesAdmin, updateProperty, deleteProperty } from "../controllers/property.controller.js";

const router = Router();

// Public routes
router.get("/", getAllProperties);
router.get("/:id", getPropertyById);

// Admin / Owner Protected routes
router.post("/", verifyJWT, upload.fields([
    { name: "images", maxCount: 10 },
    { name: "floorPlans", maxCount: 5 },
    { name: "ownerAvatar", maxCount: 1 }
]), createProperty);

router.patch("/:id", verifyJWT, upload.fields([
    { name: "images", maxCount: 10 },
    { name: "floorPlans", maxCount: 5 },
    { name: "ownerAvatar", maxCount: 1 }
]), updateProperty);

router.delete("/:id", verifyJWT, deleteProperty);

// Admin route for getting all properties with more options
router.get("/admin/all", verifyJWT, getAllPropertiesAdmin);

export default router;