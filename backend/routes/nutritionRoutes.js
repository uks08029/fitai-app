import express from 'express';
import {
  getNutrition,
  addFoodEntry,
  deleteFoodEntry,
  updateWater,
} from '../controllers/nutritionController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getNutrition);
router.post('/', protect, addFoodEntry);
router.delete('/:id', protect, deleteFoodEntry);
router.post('/water', protect, updateWater);

export default router;
