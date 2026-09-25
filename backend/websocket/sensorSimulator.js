import repo from '../services/repo.js';

class SensorSimulator {
  constructor() {
    this.intervalId = null;
    this.currentHeartRate = 72;
    this.currentSpo2 = 98;
    this.currentTemp = 36.6;
    this.currentSteps = 7420;
    this.broadcastCallback = null;
    this.isStressMode = false;
  }

  setBroadcastCallback(fn) {
    this.broadcastCallback = fn;
  }

  start(intervalMs = 1500) {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      const reading = this.generateNextReading();
      if (this.broadcastCallback) {
        this.broadcastCallback(reading);
      }
    }, intervalMs);
    console.log(`[Sensor Simulator] Started emitting realistic health readings every ${intervalMs}ms`);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[Sensor Simulator] Stopped.');
    }
  }

  setStressMode(active) {
    this.isStressMode = active;
  }

  generateNextReading(customSource = 'Demo Sensor Simulator') {
    if (this.isStressMode) {
      // Simulate physical exertion / elevated stress for testing threshold alerts
      this.currentHeartRate = Math.min(138, Math.max(115, this.currentHeartRate + Math.floor(Math.random() * 5) - 2));
      this.currentSpo2 = Math.min(96, Math.max(92, this.currentSpo2 + (Math.random() > 0.5 ? -1 : 0)));
      this.currentTemp = +(Math.min(37.9, Math.max(37.3, this.currentTemp + (Math.random() * 0.1 - 0.05)))).toFixed(1);
      this.currentSteps += Math.floor(Math.random() * 25) + 10;
    } else {
      // Realistic smooth physiological fluctuations
      const hrDelta = Math.floor(Math.random() * 5) - 2; // -2 to +2
      this.currentHeartRate = Math.min(96, Math.max(62, this.currentHeartRate + hrDelta));

      // SpO2 stays high in healthy individuals
      const spo2Chance = Math.random();
      if (spo2Chance > 0.85) {
        this.currentSpo2 = Math.min(99, Math.max(96, this.currentSpo2 + (Math.random() > 0.5 ? 1 : -1)));
      }

      // Temperature stays stable
      const tempDelta = (Math.random() * 0.08 - 0.04);
      this.currentTemp = +(Math.min(37.1, Math.max(36.4, this.currentTemp + tempDelta))).toFixed(1);

      // Steps increase gradually as person moves throughout day
      this.currentSteps += Math.floor(Math.random() * 12) + 2;
    }

    // Status evaluation
    let hrStatus = 'Normal';
    if (this.currentHeartRate > 105) hrStatus = 'Elevated';
    else if (this.currentHeartRate > 125) hrStatus = 'High';
    else if (this.currentHeartRate < 55) hrStatus = 'Low';

    let spo2Status = 'Optimal';
    if (this.currentSpo2 < 95) spo2Status = 'Low';
    if (this.currentSpo2 < 93) spo2Status = 'Critical Warning';

    let tempStatus = 'Normal';
    if (this.currentTemp > 37.5) tempStatus = 'Elevated';
    if (this.currentTemp < 36.0) tempStatus = 'Low';

    // Alerts
    let alert = null;
    if (this.currentHeartRate > 120) {
      alert = {
        type: 'HEART_RATE_HIGH',
        severity: 'warning',
        message: 'Heart rate unusually high. Demo alert — consider checking your device readings.',
      };
    } else if (this.currentSpo2 < 94) {
      alert = {
        type: 'SPO2_LOW',
        severity: 'warning',
        message: 'SpO2 below configured threshold (94%). Demo alert — consider checking your device readings.',
      };
    } else if (this.currentTemp > 37.8) {
      alert = {
        type: 'TEMP_HIGH',
        severity: 'warning',
        message: 'Temperature outside configured demo range. Demo alert — consider checking your device readings.',
      };
    }

    const payload = {
      heartRate: this.currentHeartRate,
      spo2: this.currentSpo2,
      temperature: this.currentTemp,
      steps: this.currentSteps,
      timestamp: new Date().toISOString(),
      status: {
        heartRate: hrStatus,
        spo2: spo2Status,
        temperature: tempStatus,
      },
      alert,
      source: customSource,
      isDemoSimulator: customSource === 'Demo Sensor Simulator',
    };

    return payload;
  }
}

export const sensorSimulator = new SensorSimulator();
export default sensorSimulator;
