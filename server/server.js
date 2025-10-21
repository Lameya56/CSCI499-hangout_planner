import express from 'express'
import cors from 'cors';
import './config/dotenv.js'
import { pool } from "./config/database.js";
import authRoutes from './routes/authRoutes.js';
import planRoutes from './routes/planRoutes.js';
import invitationRoutes from './routes/invitationRoutes.js';
import voteRoutes from './routes/voteRoutes.js';

const app = express()
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


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`)
})