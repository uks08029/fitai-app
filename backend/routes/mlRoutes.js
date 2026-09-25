import express from 'express';
import { predictCalories, getModelInfo } from '../controllers/mlController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.post('/predict', protect, predictCalories);
router.get('/model-info', getModelInfo);

export default router;
