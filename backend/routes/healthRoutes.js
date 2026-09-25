import express from 'express';
import {
  getHealthReadings,
  receiveSensorReading,
  simulateEvent,
} from '../controllers/healthController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.get('/readings', protect, getHealthReadings);
// Public or token-authenticated sensor ingest endpoint (for ESP32, Arduino, smartwatches, or manual frontend testing)
router.post('/reading', receiveSensorReading);
router.post('/simulate-event', protect, simulateEvent);

export default router;
