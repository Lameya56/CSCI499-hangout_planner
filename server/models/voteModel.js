import { pool } from "../config/database.js";

export const voteDates = async (userId, planId, dateIds) => {
  // First, remove existing votes
  await pool.query(
    'DELETE FROM date_votes WHERE user_id = $1 AND plan_id = $2',
    [userId, planId]
  );
  
  if (dateIds.length === 0) return [];
  
  const values = dateIds.map((_, index) => 
    `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`
  ).join(', ');
  
  const params = [];
  dateIds.forEach(dateId => {
    params.push(dateId, userId, planId);
  });
  
  const result = await pool.query(
    `INSERT INTO date_votes (plan_date_id, user_id, plan_id)
     VALUES ${values} RETURNING *`,
    params
  );
  
  return result.rows;
};

export const voteActivities = async (userId, planId, activityIds) => {
  // First, remove existing votes
  await pool.query(
    'DELETE FROM activity_votes WHERE user_id = $1 AND plan_id = $2',
    [userId, planId]
  );
  
  if (activityIds.length === 0) return [];
  
  const values = activityIds.map((_, index) => 
    `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`
  ).join(', ');
  
  const params = [];
  activityIds.forEach(activityId => {
    params.push(activityId, userId, planId);
  });
  
  const result = await pool.query(
    `INSERT INTO activity_votes (activity_id, user_id, plan_id)
     VALUES ${values} RETURNING *`,
    params
  );
  
  return result.rows;
};

export const getUserVotes = async (userId, planId) => {
  const dateVotes = await pool.query(
    'SELECT plan_date_id FROM date_votes WHERE user_id = $1 AND plan_id = $2',
    [userId, planId]
  );
  
  const activityVotes = await pool.query(
    'SELECT activity_id FROM activity_votes WHERE user_id = $1 AND plan_id = $2',
    [userId, planId]
  );
  
  return {
    dates: dateVotes.rows.map(v => v.plan_date_id),
    activities: activityVotes.rows.map(v => v.activity_id)
  };
};