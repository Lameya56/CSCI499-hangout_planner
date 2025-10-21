import express from 'express';
import { submitVotes } from '../controllers/voteController.js';
import { authenticateJWT } from '../controllers/authMiddleware.js';

const router = express.Router();

// All voting routes require authentication
router.post('/submit/:token', authenticateJWT, submitVotes);

export default router;
