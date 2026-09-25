import express from 'express';
import {
  getProgress,
  addProgressEntry,
  simulateWhatIf,
} from '../controllers/progressController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getProgress);
router.post('/', protect, addProgressEntry);
router.post('/simulate', protect, simulateWhatIf);

export default router;
