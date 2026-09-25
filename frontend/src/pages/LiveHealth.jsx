import React, { useState } from 'react';
import {
  Heart,
  Activity,
  Thermometer,
  Footprints,
  Wifi,
  WifiOff,
  Flame,
  AlertTriangle,
  Play,
  Square,
  Send,
  Cpu,
  ShieldAlert,
  Info,
  Clock,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useWebSocket } from '../context/WebSocketContext';
import { healthApi } from '../services/api';
import AlertBanner from '../components/AlertBanner';

export const LiveHealth = () => {
  const {
    isConnected,
    currentReading,
    readingHistory,
    alerts,
    clearAlert,
    isStressActive,
    toggleStressMode,
  } = useWebSocket();

  // Hardware sensor simulation form state (to test ESP32 ingest)
  const [ingestData, setIngestData] = useState({
    heartRate: 125,
    spo2: 93,
    temperature: 38.2,
    steps: 8100,
    source: 'ESP32-WROOM-32 via REST Ingest',
  });
  const [ingestSuccess, setIngestSuccess] = useState(false);
  const [ingestLoading, setIngestLoading] = useState(false);

  const handleManualIngest = async (e) => {
    e.preventDefault();
    setIngestLoading(true);
    setIngestSuccess(false);
    try {
      await healthApi.sendSensorReading({
        heartRate: Number(ingestData.heartRate),
        spo2: Number(ingestData.spo2),
        temperature: Number(ingestData.temperature),
        steps: Number(ingestData.steps),
        source: ingestData.source,
      });
      setIngestSuccess(true);
      setTimeout(() => setIngestSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to ingest sensor reading:', err);
    } finally {
      setIngestLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Title & Connection Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Activity className="w-7 h-7 text-cyan-400" />
              Live Health Telemetry
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                isConnected
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
              }`}
            >
              {isConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  WebSocket Stream Active (1.5s interval)
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  Disconnected - Reconnecting...
                </>
              )}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time biometric data streamed directly to the browser. Demonstrates IoT sensor integration.
          </p>
        </div>

        {/* Stress Mode Simulation Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => toggleStressMode(!isStressActive)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg ${
              isStressActive
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {isStressActive ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current text-rose-400" />}
            <span>{isStressActive ? 'Stop Stress Simulation' : 'Simulate Physical Exertion'}</span>
          </button>
        </div>
      </div>

      {/* Safety Notice Disclaimer */}
      <AlertBanner
        type="warning"
        title="Demo Sensor Data Notice"
        message="This interface simulates or receives telemetry from test-bench IoT hardware for software demonstration purposes. It is NOT intended as medical diagnosis or certified clinical equipment."
      />

      {/* Active Threshold Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((al) => (
            <AlertBanner
              key={al.id}
              type="error"
              title="Threshold Safety Alert"
              message={al.message}
              onClose={() => clearAlert(al.id)}
            />
          ))}
        </div>
      )}

      {/* 4 Big Live Telemetry Metric Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Heart Rate Gauge */}
        <div className="p-6 rounded-3xl glass-card border border-slate-800/80 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Heart Rate</span>
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Heart className="w-5 h-5 fill-rose-500/50 animate-heart" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              {currentReading.heartRate}
            </span>
            <span className="text-sm font-semibold text-slate-400">BPM</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-800/60">
            <span className="text-slate-400">Status</span>
            <span
              className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                currentReading.heartRate > 105
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {currentReading.status?.heartRate || 'Normal'}
            </span>
          </div>
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-rose-500/5 blur-2xl group-hover:bg-rose-500/10 transition-all pointer-events-none" />
        </div>

        {/* SpO2 Gauge */}
        <div className="p-6 rounded-3xl glass-card border border-slate-800/80 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Blood Oxygen (SpO₂)</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              {currentReading.spo2}
            </span>
            <span className="text-sm font-semibold text-slate-400">%</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-800/60">
            <span className="text-slate-400">Saturation</span>
            <span
              className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                currentReading.spo2 < 95
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              }`}
            >
              {currentReading.status?.spo2 || 'Optimal'}
            </span>
          </div>
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-cyan-500/5 blur-2xl group-hover:bg-cyan-500/10 transition-all pointer-events-none" />
        </div>

        {/* Body Temperature Gauge */}
        <div className="p-6 rounded-3xl glass-card border border-slate-800/80 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Body Temperature</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Thermometer className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              {currentReading.temperature}
            </span>
            <span className="text-sm font-semibold text-slate-400">°C</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-800/60">
            <span className="text-slate-400">Thermal Index</span>
            <span
              className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                currentReading.temperature > 37.5
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {currentReading.status?.temperature || 'Normal'}
            </span>
          </div>
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-amber-500/5 blur-2xl group-hover:bg-amber-500/10 transition-all pointer-events-none" />
        </div>

        {/* Daily Steps Gauge */}
        <div className="p-6 rounded-3xl glass-card border border-slate-800/80 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Daily Steps</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Footprints className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {currentReading.steps?.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 10k</span>
          </div>
          <div className="mt-4 space-y-1 pt-2 border-t border-slate-800/60">
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (currentReading.steps / 10000) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
              <span>Goal Progress</span>
              <span className="text-slate-200 font-bold">{Math.round((currentReading.steps / 10000) * 100)}%</span>
            </div>
          </div>
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-indigo-500/5 blur-2xl group-hover:bg-indigo-500/10 transition-all pointer-events-none" />
        </div>
      </div>

      {/* Real-time Rolling Telemetry Chart (Recharts) */}
      <div className="p-6 rounded-3xl glass-card border border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Live Telemetry Stream Buffer (35 Points)
            </h3>
            <p className="text-xs text-slate-400">
              Streaming real-time Heart Rate (BPM) and SpO₂ saturation received from WebSocket
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>Updated: {new Date(currentReading.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="h-72 sm:h-80 w-full pt-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={readingHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis yAxisId="hr" stroke="#f43f5e" fontSize={11} domain={[50, 140]} tickLine={false} />
              <YAxis yAxisId="spo2" orientation="right" stroke="#00f2fe" fontSize={11} domain={[88, 100]} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#f8fafc',
                }}
              />
              <Legend verticalAlign="top" height={36} />
              <Line
                yAxisId="hr"
                type="monotone"
                dataKey="heartRate"
                name="Heart Rate (BPM)"
                stroke="#f43f5e"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                yAxisId="spo2"
                type="monotone"
                dataKey="spo2"
                name="SpO₂ (%)"
                stroke="#00f2fe"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hardware Integration Section: Testing REST Ingest & Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hardware Ingest Form */}
        <div className="p-6 rounded-3xl glass-card border border-slate-800/80 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Hardware Telemetry Ingestion Tester</h3>
              <p className="text-xs text-slate-400">
                Simulates real-world sensor payload sent from ESP32 or Bluetooth smartwatch to <code className="text-cyan-300">POST /api/sensors/reading</code>
              </p>
            </div>
          </div>

          {ingestSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Sensor reading ingested and broadcast to all connected WebSocket clients!</span>
            </div>
          )}

          <form onSubmit={handleManualIngest} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Heart Rate (BPM)</label>
                <input
                  type="number"
                  value={ingestData.heartRate}
                  onChange={(e) => setIngestData({ ...ingestData, heartRate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-sm"
                  min="40"
                  max="220"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">SpO₂ (%)</label>
                <input
                  type="number"
                  value={ingestData.spo2}
                  onChange={(e) => setIngestData({ ...ingestData, spo2: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-sm"
                  min="70"
                  max="100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={ingestData.temperature}
                  onChange={(e) => setIngestData({ ...ingestData, temperature: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Steps</label>
                <input
                  type="number"
                  value={ingestData.steps}
                  onChange={(e) => setIngestData({ ...ingestData, steps: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Device Identification</label>
              <input
                type="text"
                value={ingestData.source}
                onChange={(e) => setIngestData({ ...ingestData, source: e.target.value })}
                className="w-full px-3 py-2 rounded-xl glass-input text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={ingestLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{ingestLoading ? 'Broadcasting...' : 'Ingest & Broadcast Hardware Telemetry'}</span>
            </button>
          </form>
        </div>

        {/* Real Hardware Architecture Guide */}
        <div className="p-6 rounded-3xl glass-card border border-slate-800/80 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">IoT Hardware Integration Blueprint</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              FitAI is architected with a decoupled telemetry pipeline. A real microcontroller like an <strong>ESP32</strong> (with MAX30102 pulse oximeter and MLX90614 infrared thermometer) connects directly to WiFi and streams readings to the backend.
            </p>

            <pre className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto whitespace-pre">
{`// Example ESP32 Arduino C++ snippet
HTTPClient http;
http.begin("http://<server_ip>:5000/api/sensors/reading");
http.addHeader("Content-Type", "application/json");
String payload = "{\\"heartRate\\": 74, \\"spo2\\": 98, \\"temperature\\": 36.6}";
int httpCode = http.POST(payload);`}
            </pre>

            <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
              <li><strong>Bluetooth Low Energy (BLE):</strong> Web Bluetooth API connects smart bands directly in browser.</li>
              <li><strong>MQTT Protocol:</strong> Bridge for low-power smart wearables.</li>
              <li><strong>Apple HealthKit / Google Health Connect:</strong> REST gateway syncing steps and heart rate.</li>
            </ul>
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Backend listener active on port 5000</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveHealth;
