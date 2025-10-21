import express from "express";
import { registerUser, loginUser, logoutUser, getProfile } from "../controllers/authController.js";
import { authenticateJWT } from "../controllers/authMiddleware.js";
import { pool } from "../config/database.js";
const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/profile", authenticateJWT, getProfile);

export default router;
