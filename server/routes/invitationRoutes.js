import express from 'express';
import { checkInvitation, getMyInvitation, respondToInvitation } from '../controllers/invitationController.js';
import { authenticateJWT } from '../controllers/authMiddleware.js';

const router = express.Router();

// Public route - just to check if invitation exists
router.get('/:token/check', checkInvitation);

// Protected route - get full invitation details for logged-in user
router.get('/:token', authenticateJWT, getMyInvitation);

router.post('/confirm/:status', respondToInvitation);

export default router;