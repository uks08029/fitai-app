import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    calories: {
      type: Number,
      default: 0,
    },
    protein: {
      type: Number,
      default: 0,
    },
    steps: {
      type: Number,
      default: 0,
    },
    waterMl: {
      type: Number,
      default: 2500,
    },
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

const Progress = mongoose.models.Progress || mongoose.model('Progress', progressSchema);
export default Progress;
