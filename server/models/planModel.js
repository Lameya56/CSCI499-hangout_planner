import { pool } from "../config/database.js";

/* =========================
   Create Plan
========================= */
export const createPlan = async (planData) => {
  const { host_id, title, time, image_url, deadline } = planData;

  const result = await pool.query(
    `INSERT INTO plans (host_id, title, time, image_url, deadline, status)
     VALUES ($1, $2, $3, $4, $5, 'pending')
     RETURNING *`,
    [host_id, title, time, image_url, deadline]
  );

  return result.rows[0];
};

/* =========================
   Add Dates
========================= */
export const addPlanDates = async (planId, dates) => {
  const values = dates.map((_, i) => `($1, $${i + 2})`).join(", ");
  const params = [planId, ...dates];

  const result = await pool.query(
    `INSERT INTO plan_dates (plan_id, date)
     VALUES ${values}
     RETURNING *`,
    params
  );

  return result.rows;
};

/* =========================
   Add Activities
========================= */
export const addActivities = async (planId, activities, userId = null) => {
  const values = activities
    .map((_, i) => `($1, $${i * 3 + 2}, $${i * 3 + 3}, $${i * 3 + 4})`)
    .join(", ");

  const params = [planId];
  activities.forEach((a) => {
    params.push(a.name, a.location, userId);
  });

  const result = await pool.query(
    `INSERT INTO activities (plan_id, name, location, suggested_by)
     VALUES ${values}
     RETURNING *`,
    params
  );

  return result.rows;
};

/* =========================
   GET USER PLANS
========================= */
export const getUserPlans = async (userId) => {
  const result = await pool.query(
    `
    SELECT 
      p.*,
      i.status AS invitation_status
    FROM plans p
    LEFT JOIN invitations i
      ON i.plan_id = p.id
      AND i.invitee_id = $1
    WHERE 
      p.host_id = $1
      OR i.invitee_id = $1
    ORDER BY p.created_at DESC
    `,
    [userId]
  );

  return result.rows;
};

/* =========================
   Get Plan Details
========================= */
export const getPlanDetails = async (planId) => {
  const planRes = await pool.query(
    `SELECT p.*, u.name AS host_name, u.email AS host_email
     FROM plans p
     JOIN users u ON p.host_id = u.id
     WHERE p.id = $1`,
    [planId]
  );

  if (planRes.rowCount === 0) return null;

  const dates = await pool.query(
    `SELECT pd.*, COUNT(dv.id) AS vote_count
     FROM plan_dates pd
     LEFT JOIN date_votes dv ON pd.id = dv.plan_date_id
     WHERE pd.plan_id = $1
     GROUP BY pd.id
     ORDER BY vote_count DESC`,
    [planId]
  );

  const activities = await pool.query(
    `SELECT a.*, COUNT(av.id) AS vote_count, u.name AS suggested_by_name
     FROM activities a
     LEFT JOIN activity_votes av ON a.id = av.activity_id
     LEFT JOIN users u ON a.suggested_by = u.id
     WHERE a.plan_id = $1
     GROUP BY a.id, u.name
     ORDER BY vote_count DESC`,
    [planId]
  );

  const invitations = await pool.query(
    `SELECT i.*, u.name AS invitee_name
     FROM invitations i
     LEFT JOIN users u ON i.invitee_id = u.id
     WHERE i.plan_id = $1`,
    [planId]
  );

  return {
    ...planRes.rows[0],
    dates: dates.rows,
    activities: activities.rows,
    invitations: invitations.rows,
  };
};

/* =========================
   Update Plan Status
========================= */
export const updatePlanStatus = async (
  planId,
  status,
  confirmedDate = null,
  confirmedActivityId = null
) => {
  const result = await pool.query(
    `UPDATE plans
     SET status = $1,
         confirmed_date = $2,
         confirmed_activity_id = $3
     WHERE id = $4
     RETURNING *`,
    [status, confirmedDate, confirmedActivityId, planId]
  );

  return result.rows[0];
};

/* =========================
   Update Plan Details
========================= */
export const updatePlanDetails = async (planId, updates) => {
  const { title, time, image_url, deadline } = updates;

  const result = await pool.query(
    `UPDATE plans
     SET
       title = COALESCE($1, title),
       time = COALESCE($2, time),
       image_url = COALESCE($3, image_url),
       deadline = COALESCE($4, deadline),
       updated_at = NOW()
     WHERE id = $5
     RETURNING *`,
    [title, time, image_url, deadline, planId]
  );

  return result.rows[0];
};

/* =========================
   Cancel Plan (soft delete)
========================= */
export const deletePlan = async (planId) => {
  const result = await pool.query(
    `UPDATE plans
     SET status = 'cancelled'
     WHERE id = $1
     RETURNING *`,
    [planId]
  );

  return result.rows[0];
};