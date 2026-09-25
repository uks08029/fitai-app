import { WebSocketServer, WebSocket } from 'ws';
import sensorSimulator from './sensorSimulator.js';
import repo from '../services/repo.js';

let wss = null;
let lastPersistTime = 0;

export const initWebSocket = (server) => {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress;
    console.log(`[WebSocket] New client connected from ${ip}. Total clients: ${wss.clients.size}`);

    // Send immediate initial handshake and current sensor state
    const currentReading = sensorSimulator.generateNextReading();
    ws.send(
      JSON.stringify({
        type: 'INITIAL_STATE',
        data: currentReading,
        message: 'Connected to FitAI Real-time Health Telemetry Stream',
        serverTime: new Date().toISOString(),
      })
    );

    ws.on('message', async (messageRaw) => {
      try {
        const msg = JSON.parse(messageRaw.toString());
        if (msg.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
        } else if (msg.type === 'TOGGLE_STRESS') {
          sensorSimulator.setStressMode(Boolean(msg.active));
          console.log(`[WebSocket] Stress/exertion simulation toggled: ${msg.active}`);
        } else if (msg.type === 'SENSOR_INGEST') {
          // Hardware telemetry ingested via WebSocket
          await broadcastSensorReading(msg.data, msg.userId);
        }
      } catch (err) {
        console.warn('[WebSocket] Malformed client message:', err.message);
      }
    });

    ws.on('close', () => {
      console.log(`[WebSocket] Client disconnected. Remaining: ${wss.clients.size}`);
    });

    ws.on('error', (err) => {
      console.error('[WebSocket] Socket error:', err.message);
    });
  });

  // Connect sensor simulator broadcast to WebSocket clients
  sensorSimulator.setBroadcastCallback(async (reading) => {
    broadcastToAll({
      type: 'SENSOR_UPDATE',
      data: reading,
    });

    // Downsample persistence: save to database every 30 seconds
    const now = Date.now();
    if (now - lastPersistTime > 30000) {
      lastPersistTime = now;
      try {
        await repo.saveReading({
          userId: '64f1a2b3c4d5e6f7a8b9c0d1', // default demo user
          heartRate: reading.heartRate,
          spo2: reading.spo2,
          temperature: reading.temperature,
          steps: reading.steps,
          source: reading.source,
          timestamp: reading.timestamp,
        });
      } catch (e) {
        // Non-critical background save
      }
    }
  });

  // Start periodic simulator emission (every 1500 ms)
  sensorSimulator.start(1500);

  return wss;
};

export const broadcastToAll = (payload) => {
  if (!wss) return;
  const str = JSON.stringify(payload);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(str);
    }
  }
};

export const broadcastSensorReading = async (readingData, userId = '64f1a2b3c4d5e6f7a8b9c0d1') => {
  const hr = Number(readingData.heartRate || 72);
  const spo2 = Number(readingData.spo2 || 98);
  const temp = Number(readingData.temperature || 36.6);
  const steps = Number(readingData.steps || 7000);
  const source = readingData.source || 'Hardware Sensor (ESP32/BLE)';

  let alert = null;
  if (hr > 120) {
    alert = {
      type: 'HEART_RATE_HIGH',
      severity: 'warning',
      message: 'Heart rate unusually high. Demo alert — consider checking your device readings.',
    };
  } else if (spo2 < 94) {
    alert = {
      type: 'SPO2_LOW',
      severity: 'warning',
      message: 'SpO2 below configured threshold (94%). Demo alert — consider checking your device readings.',
    };
  }

  const reading = {
    heartRate: hr,
    spo2,
    temperature: temp,
    steps,
    timestamp: new Date().toISOString(),
    status: {
      heartRate: hr > 100 ? 'Elevated' : 'Normal',
      spo2: spo2 < 95 ? 'Low' : 'Optimal',
      temperature: temp > 37.5 ? 'Elevated' : 'Normal',
    },
    alert,
    source,
    isDemoSimulator: false,
  };

  broadcastToAll({
    type: 'SENSOR_UPDATE',
    data: reading,
  });

  try {
    await repo.saveReading({
      userId,
      heartRate: hr,
      spo2,
      temperature: temp,
      steps,
      source,
      timestamp: reading.timestamp,
    });
  } catch (err) {
    console.warn('[WebSocket Ingest] Failed to persist hardware reading:', err.message);
  }

  return reading;
};

export default { initWebSocket, broadcastToAll, broadcastSensorReading };
