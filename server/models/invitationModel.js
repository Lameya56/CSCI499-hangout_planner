import { pool } from "../config/database.js";
import crypto from "crypto";

// Set the same offset as in your controller
const INVITE_EXPIRATION_OFFSET_HOURS = 5; // adjust as needed

// Helper function to get current time with offset
const nowWithOffset = () => new Date(Date.now() + INVITE_EXPIRATION_OFFSET_HOURS * 60 * 60 * 1000);

export const createInvitations = async (planId, invitees) => {
  const values = invitees.map((_, index) => 
    `($1, $${index * 3 + 2}, $${index * 3 + 3}, $${index * 3 + 4})`
  ).join(', ');
  
  const params = [planId];
  // Generate unique tokens for each invitee
  invitees.forEach(inv => {
    const token = crypto.randomBytes(32).toString('hex');
    params.push(inv.invitee_id || null, inv.email, token);
  });
  
  const result = await pool.query(
    `INSERT INTO invitations (plan_id, invitee_id, email, invite_token)
     VALUES ${values} RETURNING *`,
    params
  );
  
  return result.rows;
};

export const getInvitationByToken = async (token) => {
  const result = await pool.query(
    `SELECT i.*, p.*, u.name as host_name,
            i.id as invitation_id  
     FROM invitations i
     JOIN plans p ON i.plan_id = p.id
     JOIN users u ON p.host_id = u.id
     WHERE i.invite_token = $1`,
    [token]
  );
  
  return result.rows[0];
};

export const updateInvitationStatus = async (invitationId, status) => {
  const respondedAt = nowWithOffset();
  
  const result = await pool.query(
    `UPDATE invitations 
     SET status = $1, responded_at = $2
     WHERE id = $3
     RETURNING *`,
    [status, respondedAt, invitationId]
  );
  
  return result.rows[0];
};
