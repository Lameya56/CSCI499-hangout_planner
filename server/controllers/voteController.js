// controllers/voteController.js (COMPLETE FIXED VERSION)
import * as VoteModel from '../models/voteModel.js';
import * as InvitationModel from '../models/invitationModel.js';
import * as PlanModel from '../models/planModel.js';

export const submitVotes = async (req, res) => {
  try {
    const { token } = req.params;
    const { dateIds, activityIds, newActivities } = req.body;
    const userId = req.user.id;  // ✅ Now requires authentication

    // Get invitation
    const invitation = await InvitationModel.getInvitationByToken(token);

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // ✅ Verify this invitation belongs to logged-in user
    if (invitation.invitee_id !== userId) {
      return res.status(403).json({ message: 'This invitation is not for you' });
    }

    // // Check if already responded
    // if (invitation.status === 'responded') {
    //   return res.status(400).json({ message: 'You have already responded' });
    // }

    const plan = await PlanModel.getPlanDetails(invitation.plan_id);
    if (plan.status === 'cancelled') {
      return res.status(400).json({ message: 'This plan has been cancelled by the host'});
    }

    const planId = invitation.plan_id;

    // Validate that user selected at least one date
    if (!dateIds || dateIds.length === 0) {
      return res.status(400).json({ message: 'Please select at least one date' });
    }

    // If user suggested new activities, add them
    let allActivityIds = [...(activityIds || [])];
    if (newActivities && newActivities.length > 0) {
      const validNewActivities = newActivities.filter(a => a.name && a.location);
      if (validNewActivities.length > 0) {
        const addedActivities = await PlanModel.addActivities(planId, validNewActivities, userId);
        allActivityIds.push(...addedActivities.map(a => a.id));
      }
    }

    // Validate that user selected at least one activity
    if (allActivityIds.length === 0) {
      return res.status(400).json({ message: 'Please select at least one activity' });
    }

    // Submit date votes
    await VoteModel.voteDates(userId, planId, dateIds);

    // Submit activity votes
    await VoteModel.voteActivities(userId, planId, allActivityIds);

    // Update invitation status to 'responded'
    await InvitationModel.updateInvitationStatus(invitation.id, 'responded');

    res.status(200).json({ message: 'Votes submitted successfully! 🎉' });
  } catch (err) {
    console.error('Error submitting votes:', err);
    res.status(500).json({ message: 'Failed to submit votes' });
  }
};

export const getUserVotes = async (req, res) => {
  try {
    const { planId } = req.params;
    const userId = req.user.id;

    const votes = await VoteModel.getUserVotes(userId, planId);

    res.status(200).json({ votes });
  } catch (err) {
    console.error('Error fetching votes:', err);
    res.status(500).json({ message: 'Failed to fetch votes' });
  }
};