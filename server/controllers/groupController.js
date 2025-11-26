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


export const getChatHistory = async (req, res) => {
    const groupID = req.params.groupID;

    try{
        const result = await pool.query(
            `SELECT chat.message AS msg,
                    chat.time_created AS time,
                    users.name AS sender,
                    users.id AS senderID
             FROM chat
             JOIN users ON chat.user_id = users.id
             WHERE chat.plan_id = $1
             ORDER BY chat.time_created ASC`,
            [groupID]
        );

        res.json(result.rows);
    }
    catch(err){
        console.error("-------Error getting chat history-----");
        console.error(err);
        res.status(500).json({message: "failed getting chat history"});
    }
};
