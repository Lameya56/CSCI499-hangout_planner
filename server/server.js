import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server} from 'socket.io';
import express from 'express'
import cors from 'cors';

import './config/dotenv.js'
import { pool } from "./config/database.js";
import authRoutes from './routes/authRoutes.js';
import planRoutes from './routes/planRoutes.js';
import invitationRoutes from './routes/invitationRoutes.js';
import voteRoutes from './routes/voteRoutes.js';
import './utils/cronJob.js';
import groupRoutes from './routes/groupRoutes.js';
import exploreRoutes from './routes/exploreRoutes.js';


const app = express()
const server = createServer(app);
const isLocal = process.env.LOCAL === "TRUE";

const origins = isLocal
  ? ["http://localhost:5173"] // local dev frontend
  : [
      "http://lets-go.site",
      "https://lets-go.site",
      "http://www.lets-go.site",
      "https://www.lets-go.site"
    ];
 
const io = new Server(server, {
  cors: {
    origin: origins,
    methods: ["GET", "POST"],
  },
});



io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinGroup", (groupID)=>{
    socket.join(groupID);
    console.log(`user ${socket.id} joined group ${groupID}`);
  });



  socket.on("chat message", async ({groupID, msg, senderID}) => {
    console.log(`Message in group: ${groupID}`, msg);
    try{
      await pool.query(
        `INSERT INTO chat (plan_id, user_id, message) VALUES ($1, $2, $3)`,
        [groupID, senderID, msg]
      );

      const username = await pool.query(
        `SELECT name FROM users WHERE id = $1`,
        [senderID]
      );

      const sendersName = username.rows[0].name;

      io.to(groupID).emit("chat message", {msg, senderID, sender: sendersName, time: new Date()})
    }
    catch(err){
      console.log("---------message not sent to database---------")
      console.log(err);
    }
  });


  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });

  socket.on("leaveGroup", (groupID) => {
    socket.leave(groupID);
    console.log(`user ${socket.id} left group ${groupID}`);
  });


});


app.use(cors({ origin: origins, credentials: true }));
app.use(express.json())
// Routes
app.get('/', (req, res) => {
  res.status(200).send('<h1 style="text-align: center; margin-top: 50px;">Hangout Planner from server </h1>')
})
app.use("/api", authRoutes);
app.use("/api/plans", planRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/votes', voteRoutes);
app.use("/api/groups", groupRoutes);
app.use('/api/explore', exploreRoutes);

const PORT = process.env.PORT || 3001



server.listen(PORT, "0.0.0.0", () => {
  if(process.env.LOCAL === "TRUE"){
    console.log(`🚀 Server listening on http://localhost:${PORT}`)
  }
  else{
    console.log(`🚀 Server listening on https://lets-go.site`)
  }
  
})
console.log("JWT_SECRET is:", process.env.JWT_SECRET);












