import { pool } from "../config/database.js";

export const getUserGroups = async (req, res) => {
    const userID = req.user.id;

    try{
        const result = await pool.query(
            `
            SELECT DISTINCT p.id, p.title
            FROM plans p
            LEFT JOIN invitations i ON p.id = i.plan_id
            WHERE p.host_id = $1 
            OR (i.invitee_id = $1 AND i.status != 'pending');
           `,[userID]
        );
        res.json(result.rows);

    }
    catch (err){
        console.error("Error fetching groups for GroupChat:", err);
        res.status(500).json({ message: "Failed to fetch groups" });
    }
};