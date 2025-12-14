import { pool } from "../config/database.js";

// Set offset hours (same as your controller)
const TIME_OFFSET_HOURS = 5; 
const nowWithOffset = () => new Date(Date.now() + TIME_OFFSET_HOURS * 60 * 60 * 1000);


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
         confirmed_activity_id = $3,
         updated_at = $4
     WHERE id = $5
     RETURNING *`,
    [status, confirmedDate, confirmedActivityId, nowWithOffset(), planId]
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
       updated_at = $5
     WHERE id = $6
     RETURNING *`,
    [title, time, image_url, deadline, nowWithOffset(), planId]
  );

  return result.rows[0];
};

/* =========================
   Cancel Plan (soft delete)
========================= */
export const deletePlan = async (planId) => {
  const result = await pool.query(
    `UPDATE plans
     SET status = 'cancelled',
         updated_at = $2
     WHERE id = $1
     RETURNING *`,
    [planId, nowWithOffset()]
  );

  return result.rows[0];
};
