import express from 'express';
import { 
  createPlan, 
  getUserPlans, 
  getPlanById 
} from '../controllers/planController.js';
import { authenticateJWT } from '../controllers/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateJWT, createPlan);
router.get('/', authenticateJWT, getUserPlans);
router.get('/:id', authenticateJWT, getPlanById);

export default router;