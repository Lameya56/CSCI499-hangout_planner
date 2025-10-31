import { pool } from "../config/database.js";

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

export const addPlanDates = async (planId, dates) => {
  const values = dates.map((date, index) => 
    `($1, $${index + 2})`
  ).join(', ');
  
  const params = [planId, ...dates];
  
  const result = await pool.query(
    `INSERT INTO plan_dates (plan_id, date) VALUES ${values} RETURNING *`,
    params
  );
  
  return result.rows;
};

export const addActivities = async (planId, activities, userId = null) => {
  const values = activities.map((_, index) => 
    `($1, $${index * 3 + 2}, $${index * 3 + 3}, $${index * 3 + 4})`
  ).join(', ');
  
  const params = [planId];
  activities.forEach(act => {
    params.push(act.name, act.location, userId);
  });
  
  const result = await pool.query(
    `INSERT INTO activities (plan_id, name, location, suggested_by) 
     VALUES ${values} RETURNING *`,
    params
  );
  
  return result.rows;
};

export const getUserPlans = async (userId) => {
  const result = await pool.query(
    `SELECT DISTINCT p.*, 
            CASE 
              WHEN p.status = 'confirmed' THEN 'confirmed'
              WHEN NOW() < p.deadline THEN 'active'
              ELSE 'expired'
            END as display_status,
            CASE 
              WHEN p.host_id = $1 THEN 'host'
              ELSE 'invitee'
            END as user_role
     FROM plans p
     LEFT JOIN invitations i ON p.id = i.plan_id
     WHERE p.host_id = $1 OR i.invitee_id = $1
     ORDER BY p.created_at DESC`,
    [userId]
  );
  
  return result.rows;
};

export const getPlanDetails = async (planId) => {
  const plan = await pool.query(
    `SELECT p.*, u.name as host_name, u.email as host_email
     FROM plans p
     JOIN users u ON p.host_id = u.id
     WHERE p.id = $1`,
    [planId]
  );
  
  if (plan.rows.length === 0) return null;
  //Get dates with vote counts
  const dates = await pool.query(
    `SELECT pd.*, COUNT(dv.id) as vote_count
     FROM plan_dates pd
     LEFT JOIN date_votes dv ON pd.id = dv.plan_date_id
     WHERE pd.plan_id = $1
     GROUP BY pd.id
     ORDER BY vote_count DESC`,
    [planId]
  );
  
  const activities = await pool.query(
    `SELECT a.*, COUNT(av.id) as vote_count, u.name as suggested_by_name
     FROM activities a
     LEFT JOIN activity_votes av ON a.id = av.activity_id
     LEFT JOIN users u ON a.suggested_by = u.id
     WHERE a.plan_id = $1
     GROUP BY a.id, u.name
     ORDER BY vote_count DESC`,
    [planId]
  );
  
  const invitations = await pool.query(
    `SELECT i.*, u.name as invitee_name
     FROM invitations i
     LEFT JOIN users u ON i.invitee_id = u.id
     WHERE i.plan_id = $1`,
    [planId]
  );
  
  return {
    ...plan.rows[0],
    dates: dates.rows,
    activities: activities.rows,
    invitations: invitations.rows
  };
};

export const updatePlanStatus = async (planId, status, confirmedDate = null, confirmedActivityId = null) => {
  const result = await pool.query(
    `UPDATE plans 
     SET status = $1, confirmed_date = $2, confirmed_activity_id = $3
     WHERE id = $4
     RETURNING *`,
    [status, confirmedDate, confirmedActivityId, planId]
  );
  
  return result.rows[0];
};

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
}

export const deletePlan = async (planId) => {
  // await pool.query('DELETE FROM plans WHERE id = $1', [planId]);
  const result = await pool.query(
    `UPDATE plans 
     SET status = 'cancelled'
     WHERE id = $1
     RETURNING *`,
    [planId]
  );

  console.log(req.user.name);
  
  return result.rows[0];
};