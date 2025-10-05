import express from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/authController.js";
import { authenticateJWT } from "../controllers/authMiddleware.js";
import { pool } from "../config/database.js";
const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/profile", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.user;
    const result = await pool.query("SELECT id, name, email FROM users WHERE id = $1", [id]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
