import express from "express";
import { registerUser, loginUser, logoutUser, getProfile, updateProfile, updatePassword } from "../controllers/authController.js";
import { authenticateJWT } from "../controllers/authMiddleware.js";
import { pool } from "../config/database.js";
const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/profile", authenticateJWT, getProfile);
router.patch("/profile/update", authenticateJWT, updateProfile);
router.patch("/profile/password", authenticateJWT, updatePassword);

export default router;
