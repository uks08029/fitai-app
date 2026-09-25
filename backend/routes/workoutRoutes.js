import express from 'express';
import {
  getWorkouts,
  createWorkout,
  updateWorkout,
  toggleExercise,
  deleteWorkout,
} from '../controllers/workoutController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getWorkouts);
router.post('/', protect, createWorkout);
router.put('/:id', protect, updateWorkout);
router.post('/:id/toggle-exercise', protect, toggleExercise);
router.delete('/:id', protect, deleteWorkout);

export default router;
