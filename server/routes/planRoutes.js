import express from 'express';
import { 
  createPlan, 
  getUserPlans, 
  getPlanById,
  updatePlan,
  deletePlan,
  getFinalizedPlanByToken
} from '../controllers/planController.js';
import { authenticateJWT } from '../controllers/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateJWT, createPlan);
router.get('/', authenticateJWT, getUserPlans);
router.get('/:id', authenticateJWT, getPlanById);
router.put('/', authenticateJWT, updatePlan);
router.delete('/:id', authenticateJWT, deletePlan);
router.get('/finalized/:token', getFinalizedPlanByToken);

export default router;