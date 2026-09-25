import repo from '../services/repo.js';
import { broadcastSensorReading } from '../websocket/socketServer.js';
import sensorSimulator from '../websocket/sensorSimulator.js';

export const getHealthReadings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = Number(req.query.limit) || 20;

    const readings = await repo.getRecentReadings(userId, limit);
    const latest = readings[0] || sensorSimulator.generateNextReading();

    res.json({
      success: true,
      currentReading: latest,
      recentHistory: readings,
    });
  } catch (error) {
    next(error);
  }
};

export const receiveSensorReading = async (req, res, next) => {
  try {
    const { heartRate, spo2, temperature, steps, source, userId } = req.body;

    if (heartRate === undefined || spo2 === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Heart rate and SpO2 readings are required.',
      });
    }

    const targetUserId = userId || req.user?.id || '64f1a2b3c4d5e6f7a8b9c0d1';

    const broadcastedReading = await broadcastSensorReading(
      {
        heartRate,
        spo2,
        temperature: temperature || 36.6,
        steps: steps || 0,
        source: source || 'Hardware Sensor (ESP32/BLE)',
      },
      targetUserId
    );

    res.status(201).json({
      success: true,
      message: 'Sensor reading ingested and broadcast to all live clients.',
      reading: broadcastedReading,
    });
  } catch (error) {
    next(error);
  }
};

export const simulateEvent = async (req, res, next) => {
  try {
    const { action } = req.body; // 'stress', 'normal', 'spike'

    if (action === 'stress') {
      sensorSimulator.setStressMode(true);
    } else if (action === 'normal') {
      sensorSimulator.setStressMode(false);
    }

    const current = sensorSimulator.generateNextReading();

    res.json({
      success: true,
      message: `Simulator updated to ${action} mode.`,
      currentReading: current,
    });
  } catch (error) {
    next(error);
  }
};

export default { getHealthReadings, receiveSensorReading, simulateEvent };
