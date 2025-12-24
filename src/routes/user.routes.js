import { Router } from "express";
import { registerUser, verifyOtp, loginUser, logoutUser, getAllUsers, getCurrentUserProfile, updateCurrentUserProfile, updateCurrentUserAvatar } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/verify", verifyOtp);
router.post("/login", loginUser);
router.post("/logout", verifyJWT, logoutUser);

// Admin routes
router.get("/", verifyJWT, getAllUsers);

// Current user profile routes
router.get("/profile", verifyJWT, getCurrentUserProfile);
router.put("/profile", verifyJWT, updateCurrentUserProfile);
router.put("/profile/avatar", verifyJWT, upload.single("avatar"), updateCurrentUserAvatar);

export default router;