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

import { pool } from "../config/database.js";

// ... existing exports like createInvitations, etc.

/**
 * Delete all invitations for a plan.
 * Simple approach: when host edits invitees, we drop old ones and recreate.
 */
export const deleteInvitationsByPlan = async (planId) => {
  await pool.query("DELETE FROM invitations WHERE plan_id = $1", [planId]);
};
