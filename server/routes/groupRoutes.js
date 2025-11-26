import express from "express";
import { getUserGroups, getChatHistory } from "../controllers/groupController.js";
import { authenticateJWT } from "../controllers/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateJWT, getUserGroups, getChatHistory);

router.get("/:groupID/chat", authenticateJWT, getChatHistory);

export default router;
