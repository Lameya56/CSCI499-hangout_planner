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
import imagesRoutes from './routes/images.js';
import path from "path";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express()
const server = createServer(app);
const origins = ["http://lets-go.site", "https://lets-go.site", "http://www.lets-go.site", "https://www.lets-go.site"];
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


app.use(cors({ origin: origins, credentials: true }));
app.use(express.json())

if (process.env.LOCAL === "TRUE") {
  app.use('/uploads', express.static('uploads')); // <-- make local files accessible
  }

// Routes
app.get('/', (req, res) => {
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));
})
app.use("/api", authRoutes);
app.use("/api/plans", planRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/votes', voteRoutes);
app.use("/api/groups", groupRoutes);
app.use('/api/images', imagesRoutes)

const PORT = process.env.PORT || 3001



server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server listening on http://lets-go.site:${PORT}`)
})
console.log("JWT_SECRET is:", process.env.JWT_SECRET);






