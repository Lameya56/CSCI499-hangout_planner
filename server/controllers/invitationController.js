import * as InvitationModel from '../models/invitationModel.js';
import * as PlanModel from '../models/planModel.js';
import * as VoteModel from '../models/voteModel.js';
import { pool } from "../config/database.js";

// Set your desired offset in hours (e.g., 6 for UTC+5)
const INVITE_EXPIRATION_OFFSET_HOURS = 5;

// Helper: returns current time + offset in milliseconds
const nowWithOffset = () => new Date(Date.now() + INVITE_EXPIRATION_OFFSET_HOURS * 60 * 60 * 1000);

// Public route - check if invitation exists
export const checkInvitation = async (req, res) => {
  try {
    const { token } = req.params;

    const invitation = await InvitationModel.getInvitationByToken(token);

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // Check if deadline has passed using offset
    if (new Date(invitation.deadline) < nowWithOffset()) {
      return res.status(400).json({ message: 'This invitation has expired' });
    }

    res.status(200).json({ 
      exists: true,
      requiresAuth: !invitation.invitee_id,
      inviteeEmail: invitation.email
    });
  } catch (err) {
    console.error('Error checking invitation:', err);
    res.status(500).json({ message: 'Failed to check invitation' });
  }
};

// Protected route - get full invitation details
export const getMyInvitation = async (req, res) => {
  try {
    const { token } = req.params;
    const userId = req.user.id;

    const invitation = await InvitationModel.getInvitationByToken(token);

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // Check if this invitation belongs to the logged-in user
    if (invitation.invitee_id !== userId) {
      return res.status(403).json({ message: 'This invitation is not for you' });
    }

    // Check if already responded
    if (invitation.status === 'responded') {
      return res.status(400).json({ 
        message: 'You have already responded to this invitation',
        alreadyResponded: true
      });
    }

    // Get full plan details with vote counts
    const planDetails = await PlanModel.getPlanDetails(invitation.plan_id);

    // Get user's existing votes if any
    const existingVotes = await VoteModel.getUserVotes(userId, invitation.plan_id);

    res.status(200).json({ 
      invitation,
      plan: planDetails,
      existingVotes
    });
  } catch (err) {
    console.error('Error fetching invitation:', err);
    res.status(500).json({ message: 'Failed to fetch invitation' });
  }
};


/**
 * Accept or Decline an invitation
 * URL example: POST /api/invitations/confirm/accept?token=123abc
 */
export const respondToInvitation = async (req, res) => {
  const { status } = req.params; // "accepted" or "declined"
  const { token } = req.query;   // token from URL query

  if (!["accepted", "declined"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    // 1. Find invitation by token
    const invitationResult = await pool.query(
      `SELECT id, plan_id, status 
       FROM invitations 
       WHERE invite_token = $1`,
      [token]
    );

    if (invitationResult.rowCount === 0) {
      return res.status(404).json({ message: "Invalid or expired token" });
    }

    const invitation = invitationResult.rows[0];

    // If invitation is pending, reject response
    if (invitation.status === "pending") {
      return res.status(400).json({
        message: "You did not respond to the original invitation. You cannot submit a decision."
      });
    }

    // Check plan status and decision window
    const planResult = await pool.query(
      `SELECT status, decision_over_email_sent 
       FROM plans 
       WHERE id = $1`,
      [invitation.plan_id]
    );

    if (planResult.rowCount === 0) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const plan = planResult.rows[0];

    if (plan.status === "cancelled") {
      return res.status(400).json({
        message: "This plan has been cancelled. Decision is not allowed."
      });
    }

    if (plan.decision_over_email_sent === true) {
      return res.status(400).json({
        message: "The decision window has ended. You can no longer accept or decline."
      });
    }

    // 3. Update invitation status with UTC timestamp
    const respondedAtUTC = new Date(); // still UTC, best practice
    await pool.query(
      `UPDATE invitations
       SET status = $1, responded_at = $2
       WHERE id = $3`,
      [status, respondedAtUTC, invitation.id]
    );

    res.json({ message: `Invitation ${status} successfully.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
