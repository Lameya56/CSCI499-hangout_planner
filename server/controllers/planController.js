import * as PlanModel from '../models/planModel.js';
import * as InvitationModel from '../models/invitationModel.js';
import { sendInvitationEmail } from '../utils/emailService.js';
import * as VoteModel from '../models/voteModel.js';
import { pool } from "../config/database.js";


export const createPlan = async (req, res) => {
  try {
    const { title, dates, time, image, activities, invites, deadline, hostVote } = req.body;
    const userId = req.user.id;

    // Create the plan
    const plan = await PlanModel.createPlan({
      host_id: userId,
      title,
      time,
      image_url: image,
      deadline
    });
    console.log('✅ Plan created:', plan.id);

    // Add dates
    let addedDates = [];
    if (dates && dates.length > 0) {
      const dateValues = dates.map(d => d.name);
      addedDates = await PlanModel.addPlanDates(plan.id, dateValues);
    }

    // Add activities
    let addedActivities = [];
    if (activities && activities.length > 0) {
      addedActivities = await PlanModel.addActivities(plan.id, activities);
    }
    // ✅ NEW: If hostVote is true, automatically vote for all dates and activities
    if (hostVote && addedDates.length > 0 && addedActivities.length > 0) {
      const dateIds = addedDates.map(d => d.id);
      const activityIds = addedActivities.map(a => a.id);
      
      await VoteModel.voteDates(userId, plan.id, dateIds);
      await VoteModel.voteActivities(userId, plan.id, activityIds);
      
      console.log(`✅ Host automatically voted for plan ${plan.id}`);
    }

    // Create invitations
    if (invites && invites.length > 0) {
      const invitees = invites.map(inv => ({ email: inv.email }));
      const invitations = await InvitationModel.createInvitations(plan.id, invitees);
      console.log('✅ Invitations created:', invitations.length);
      // Send invitation emails
      for (const invitation of invitations) {
        await sendInvitationEmail(invitation, plan, title);
      }
      console.log('✅ All invitation emails sent!');
    }

    // Fetch complete plan details
    const planDetails = await PlanModel.getPlanDetails(plan.id);

    res.status(201).json({
      message: 'Plan created successfully',
      plan: planDetails
    });
  } catch (err) {
    console.error('Error creating plan:', err);
    res.status(500).json({ message: 'Failed to create plan' });
  }
};

export const getUserPlans = async (req, res) => {
  try {
    const userId = req.user.id;
    const plans = await PlanModel.getUserPlans(userId);
    res.status(200).json({ plans });
  } catch (err) {
    console.error('Error fetching plans:', err);
    res.status(500).json({ message: 'Failed to fetch plans' });
  }
};

export const getPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const plan = await PlanModel.getPlanDetails(id);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // Check if user has access (host or invitee)
    const hasAccess = plan.host_id === userId || 
                      plan.invitations.some(inv => inv.invitee_id === userId);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({ plan });
  } catch (err) {
    console.error('Error fetching plan:', err);
    res.status(500).json({ message: 'Failed to fetch plan' });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;          // plan id from /api/plans/:id
    const userId = req.user.id;

    // Use the same fields as createPlan:
    const { title, dates, time, image, activities, invites, deadline, hostVote } = req.body;

    // 1) Make sure plan exists and user is host
    const existingPlan = await PlanModel.getPlanDetails(id);
    if (!existingPlan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    if (existingPlan.host_id !== userId) {
      return res.status(403).json({ message: "Only host can update plan" });
    }

    // Prevent updates if plan is cancelled
    if (existingPlan.status === "cancelled") {
      return res.status(400).json({
        message: "This plan has been cancelled and can no longer be updated",
      });
    }

    // 2) Update the core plan row (title, time, image_url, deadline)
    //    This uses your existing PlanModel.updatePlanDetails but
    //    we make sure to pass image_url as well.
    await PlanModel.updatePlanDetails(id, {
      title,
      time,
      image_url: image,    // ⭐ make sure your updatePlanDetails handles this
      deadline,
    });

    // 3) Replace dates: delete old, insert new (using your existing addPlanDates)
    await pool.query("DELETE FROM plan_dates WHERE plan_id = $1", [id]);
    let addedDates = [];
    if (dates && dates.length > 0) {
      const dateValues = dates.map((d) => d.name); // same shape as createPlan
      addedDates = await PlanModel.addPlanDates(id, dateValues);
    }

    // 4) Replace activities: delete old, insert new
    await pool.query("DELETE FROM activities WHERE plan_id = $1", [id]);
    let addedActivities = [];
    if (activities && activities.length > 0) {
      addedActivities = await PlanModel.addActivities(id, activities);
    }

    // 5) Replace invitations: delete old, recreate from emails
    await pool.query("DELETE FROM invitations WHERE plan_id = $1", [id]);
    if (invites && invites.length > 0) {
      const invitees = invites.map((inv) => ({ email: inv.email }));
      const invitations = await InvitationModel.createInvitations(id, invitees);

      // If you want to re-email updated invite list, you can re-use sendInvitationEmail:
      for (const invitation of invitations) {
        await sendInvitationEmail(
          invitation,
          { ...existingPlan, id, title, image_url: image, deadline, time },
          title
        );
      }
    }

    // 6) Optional: host auto-vote again for the updated set of options
    if (hostVote && addedDates.length > 0 && addedActivities.length > 0) {
      const dateIds = addedDates.map((d) => d.id);
      const activityIds = addedActivities.map((a) => a.id);

      // Depending on your schema, you might want to clear old votes here,
      // but at minimum this will add votes for the new options.
      await VoteModel.voteDates(userId, id, dateIds);
      await VoteModel.voteActivities(userId, id, activityIds);
    }

    // 7) Return fresh plan details (same shape PlanDetails already uses)
    const updatedPlan = await PlanModel.getPlanDetails(id);

    return res
      .status(200)
      .json({ message: "Plan updated successfully", plan: updatedPlan });
  } catch (err) {
    console.error("Error updating plan:", err);
    res.status(500).json({ message: "Failed to update plan" });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const plan = await PlanModel.getPlanDetails(id);

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    if (plan.host_id !== userId) {
      return res.status(403).json({ message: 'Only host can delete plan' });
    }

    await PlanModel.deletePlan(id);

    res.status(200).json({ message: 'Plan deleted successfully' });
  } catch (err) {
    console.error('Error deleting plan:', err);
    res.status(500).json({ message: 'Failed to delete plan' });
  }
};


/**
 * Get finalized plan details + invitation info by token
 */
export const getFinalizedPlanByToken = async (req, res) => {
  const { token } = req.params;

  try {
    // 1. Find the invitation by token
    const invitationResult = await pool.query(
      `SELECT i.id AS invitation_id, i.plan_id, i.status, u.email AS invitee_email
       FROM invitations i
       JOIN users u ON i.invitee_id = u.id
       WHERE i.invite_token = $1`,
      [token]
    );

    if (invitationResult.rowCount === 0) {
      return res.status(404).json({ message: "Invalid or expired token" });
    }

    const invitation = invitationResult.rows[0];

    // 2. Get the plan details
    const planResult = await pool.query(
      `SELECT p.id, p.title, p.host_id, u.name AS host_name,
              p.status,
              p.decision_over_email_sent,
              p.confirmed_date,
              p.time,
              a.id AS winning_activity_id,
              a.name AS winning_activity_name,
              a.location AS winning_activity_location
       FROM plans p
       JOIN users u ON p.host_id = u.id
       LEFT JOIN activities a ON a.id = p.confirmed_activity_id
       WHERE p.id = $1`,
      [invitation.plan_id]
    );

    if (planResult.rowCount === 0) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const plan = planResult.rows[0];
    const finalized_datetime = plan.confirmed_date && plan.time
      ? `${plan.confirmed_date.toISOString().split('T')[0]}T${plan.time}` 
      : null;

    // 3. Get all invitees for this plan
    const inviteesResult = await pool.query(
      `SELECT u.email
       FROM invitations i
       JOIN users u ON i.invitee_id = u.id
       WHERE i.plan_id = $1`,
      [plan.id]
    );

    const invitees = inviteesResult.rows;

    // 4. Build response
    return res.json({
      invitation: {
        id: invitation.invitation_id,
        status: invitation.status,
        email: invitation.invitee_email,
      },
      plan: {
        id: plan.id,
        title: plan.title,
        host_name: plan.host_name,
        status: plan.status,
        decision_over_email_sent: plan.decision_over_email_sent,
        finalized_datetime,
        winning_activity: {
          id: plan.winning_activity_id,
          name: plan.winning_activity_name,
          location: plan.winning_activity_location,
        },
        invitees,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};