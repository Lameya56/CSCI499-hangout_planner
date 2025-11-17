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



const app = express()
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  }, 
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinGroup", (groupID)=>{
    socket.join(groupID);
    console.log(`user ${socket.id} joined group ${groupID}`);
  });



  socket.on("chat message", ({groupID, msg, sender}) => {
    console.log(`Message in group: ${groupID}`, msg);
    io.to(groupID).emit("chat message", {msg, sender})
  });


  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });

  socket.on("leaveGroup", (groupID) => {
    socket.leave(groupID);
    console.log(`user ${socket.id} left group ${groupID}`);
  });


});



app.use(cors({ origin: "http://localhost:5173", credentials: true }))
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


const PORT = process.env.PORT || 3001



server.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`)
})