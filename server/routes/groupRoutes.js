import express from "express";
import { getUserGroups } from "../controllers/groupController.js";
import { authenticateJWT } from "../controllers/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateJWT, getUserGroups);

export default router;
