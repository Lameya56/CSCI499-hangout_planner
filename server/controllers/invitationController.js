import * as InvitationModel from '../models/invitationModel.js';
import * as PlanModel from '../models/planModel.js';
import * as VoteModel from '../models/voteModel.js';

// Public route - check if invitation exists
export const checkInvitation = async (req, res) => {
  try {
    const { token } = req.params;

    const invitation = await InvitationModel.getInvitationByToken(token);

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // Check if deadline has passed
    if (new Date(invitation.deadline) < new Date()) {
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

    console.log('📥 Fetching invitation for user:', userId);

    const invitation = await InvitationModel.getInvitationByToken(token);

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // Check if this invitation belongs to the logged-in user
    if (invitation.invitee_id !== userId) {
      return res.status(403).json({ message: 'This invitation is not for you' });
    }
    console.log('Invitation status:', invitation.status);
    console.log('Invitation invitee_id:', invitation.invitee_id);
    console.log('Current user id:', userId)

    // Check if already responded
    if (invitation.status === 'responded') {
      console.log('⚠️ User already responded to this invitation');
      return res.status(400).json({ 
        message: 'You have already responded to this invitation',
        alreadyResponded: true
      });
    }

    // Get full plan details with vote counts
    const planDetails = await PlanModel.getPlanDetails(invitation.plan_id);

    // Get user's existing votes if any
    const existingVotes = await VoteModel.getUserVotes(userId, invitation.plan_id);

    console.log('✅ Invitation fetched successfully');

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