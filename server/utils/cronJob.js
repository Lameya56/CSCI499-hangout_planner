import cron from "node-cron"
import { pool } from "../config/database.js";
import { sendPlanConfirmationEmail } from "./emailService.js";

cron.schedule("*/10 * * * *", async () => {
    console.log("--------------------------testing cron execution--------------------------");
    const startTime = Date.now();
    try {
        console.log("------------Searching for pending groups with passed deadlines------------");
        const planResult = await pool.query(`
            SELECT id, deadline, title, time
            FROM plans
            WHERE status = 'pending'
            ORDER BY deadline ASC
            `);

        for( let plan of planResult.rows){      
            if(new Date(plan.deadline) > new Date()) {
                break;
            }
            try{
                await pool.query('BEGIN');

                const mostVotedDateID = await pool.query(`
                    SELECT plan_date_id, count(*) AS vote_count
                    FROM date_votes
                    WHERE plan_id = $1
                    GROUP BY plan_date_id
                    ORDER BY vote_count DESC
                    LIMIT 1
                `,[plan.id]);

                const mostVotedDate = await pool.query(`
                    SELECT date
                    FROM plan_dates
                    WHERE id = $1
                    `, [mostVotedDateID.rows[0].plan_date_id]);

                const confirmedDate = mostVotedDate.rows[0].date;

                await pool.query(`
                    UPDATE plan_dates
                    SET is_confirmed = TRUE
                    WHERE plan_id = $1 AND date = $2
                    `, [plan.id, confirmedDate]);
                

                const mostVotedActivity = await pool.query(`
                    SELECT activity_id, name, location, count(*) AS vote_count
                    FROM activity_votes
                    JOIN activities ON activity_votes.activity_id = activities.id
                    WHERE activities.plan_id = $1
                    GROUP BY activity_id, name, location
                    ORDER BY vote_count DESC
                    LIMIT 1
                    `, [plan.id]);

                const confirmedActivity = mostVotedActivity.rows[0];

                await pool.query(`
                  UPDATE activities
                    SET is_confirmed = TRUE
                    WHERE plan_id = $1 AND id = $2
                    `, [plan.id, confirmedActivity.activity_id]);

                
                await pool.query(`
                    UPDATE plans
                    SET status = 'confirmed', updated_at = NOW(), confirmed_date = $2, confirmed_activity_id = $3
                    WHERE id = $1
                    `, [plan.id, confirmedDate, confirmedActivity.activity_id]);

                await pool.query('COMMIT');
                console.log(`Plan ${plan.id} updated.`);


                try {
                    const participants = await pool.query(`
                        SELECT u.email, i.invite_token
                        FROM invitations i
                        JOIN users u ON i.invitee_id = u.id
                        WHERE i.plan_id = $1 AND i.status = 'responded'
                    `, [plan.id]); 

                    for (const participant of participants.rows) {
                        const { email, invite_token } = participant;
                        await sendPlanConfirmationEmail(email, plan, confirmedDate, confirmedActivity, invite_token);
                    }
                }
                catch (err) {
                    console.log("Error fetching participant emails or sending emails:", err);
                }

            }
            catch(err){
                console.log("----------------------Cron Error----------------------");
                await pool.query('ROLLBACK');
                console.log(`Plan ${plan.id} failed and rolled back.`)
                console.log(err);
            }
        };
        
    }
    catch(err){
        console.log("----------------------Cron Error----------------------");
        console.log("Cron job failed while looking for plans whos deadline passed.", err);
    }
    finally {
        const endTime = Date.now();
        const timeTaken = endTime - startTime;
        console.log(`------------------Cron job took ${timeTaken} ms------------------`);
    }
});