import mongoose from 'mongoose';

const exerciseItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number, required: true, default: 3 },
  reps: { type: Number, required: true, default: 12 },
  weightKg: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  restSec: { type: Number, default: 60 },
  targetMuscle: { type: String, default: 'Full Body' },
});

const workoutSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Strength', 'Cardio', 'HIIT', 'Hypertrophy', 'Recovery', 'Custom'],
      default: 'Strength',
    },
    duration: {
      type: Number, // in minutes
      required: true,
      default: 45,
    },
    caloriesBurned: {
      type: Number,
      required: true,
      default: 320,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    exercises: [exerciseItemSchema],
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Workout = mongoose.models.Workout || mongoose.model('Workout', workoutSchema);
export default Workout;
