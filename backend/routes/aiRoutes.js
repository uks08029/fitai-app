import express from 'express';
import {
  chatWithCoach,
  getChatHistory,
  clearChatHistory,
  generateMealPlan,
  generateWorkoutPlan,
} from '../controllers/aiController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.post('/chat', protect, chatWithCoach);
router.get('/chat/history', protect, getChatHistory);
router.delete('/chat', protect, clearChatHistory);
router.post('/meal-plan', protect, generateMealPlan);
router.post('/workout', protect, generateWorkoutPlan);

export default router;
