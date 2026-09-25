import mongoose from 'mongoose';

const healthReadingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    heartRate: {
      type: Number,
      required: true,
    },
    spo2: {
      type: Number,
      required: true,
    },
    temperature: {
      type: Number,
      required: true,
    },
    steps: {
      type: Number,
      required: true,
      default: 0,
    },
    source: {
      type: String,
      default: 'Demo Sensor Simulator',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const HealthReading = mongoose.models.HealthReading || mongoose.model('HealthReading', healthReadingSchema);
export default HealthReading;
