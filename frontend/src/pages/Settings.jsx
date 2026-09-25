import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  RotateCcw,
  Shield,
  Activity,
  Wifi,
  Database,
  Cpu,
  LogOut,
  AlertTriangle,
  CheckCircle,
  Info,
  Server,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { authApi } from '../services/api';
import AlertBanner from '../components/AlertBanner';

export const Settings = () => {
  const { user, logout } = useAuth();
  const { isConnected, isStressActive, toggleStressMode } = useWebSocket();
  const [resetting, setResetting] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleResetDemoData = async () => {
    if (!window.confirm('Reset all demo data (workouts, meals, biometrics) back to default state?')) {
      return;
    }
    try {
      setResetting(true);
      const res = await authApi.resetDemo();
      if (res.data.success) {
        setAlert({
          type: 'info',
          message: 'Demo dataset successfully restored to original high-fidelity state! Reloading view...',
        });
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      }
    } catch (err) {
      console.error('Reset failed:', err);
      setAlert({ type: 'error', message: 'Failed to reset demo dataset.' });
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-cyan-400" />
          System Settings & Diagnostics
        </h2>
        <p className="text-xs text-slate-400">
          Telemetry streaming controls, backend services status, and environment sandbox management
        </p>
      </div>

      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* System Health & Microservices Grid */}
      <div className="p-6 rounded-3xl glass-card border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">System Architecture Diagnostics</h3>
          </div>
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Operational
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                Persistence Layer
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              In-Memory High-Fidelity JSON Store with MongoDB auto-connect fallback.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                WebSocket Pipeline
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isConnected
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}
              >
                {isConnected ? 'STREAMING' : 'OFFLINE'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Low-latency 1.5s biometric telemetry broadcast (Heart Rate, SpO₂, Temp, Steps).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                ML & AI Engine
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                ENABLED
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Random Forest Caloric Regressor + Google Gemini AI sports science coach.
            </p>
          </div>
        </div>
      </div>

      {/* Hardware Telemetry Simulation Controls */}
      <div className="p-6 rounded-3xl glass-card border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-rose-400" />
            <h3 className="text-base font-bold text-white">Biometric Telemetry Simulation</h3>
          </div>
          <span className="text-xs text-slate-400">Real-time stimulus simulation</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-white">Tachycardia / Anaerobic Stress Mode</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulates elevated heart rate (&gt;130 BPM) and SpO₂ dips to verify real-time threshold alert triggers.
            </p>
          </div>

          <button
            onClick={() => toggleStressMode(!isStressActive)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              isStressActive
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            {isStressActive ? 'Disable Stress Mode' : 'Trigger Stress Anomaly'}
          </button>
        </div>
      </div>

      {/* Sandbox & Data Management */}
      <div className="p-6 rounded-3xl glass-card border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Demo Data Sandbox Management</h3>
          </div>
          <span className="text-xs text-amber-400 font-semibold">Evaluation Mode</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-white">Restore Initial Demo State</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Resets logged workouts, meals, biometric history, and user profile back to curated seed defaults.
            </p>
          </div>

          <button
            onClick={handleResetDemoData}
            disabled={resetting}
            className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all self-start sm:self-auto"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>{resetting ? 'Resetting Data...' : 'Reset Demo Dataset'}</span>
          </button>
        </div>
      </div>

      {/* Account Info & Logout */}
      <div className="p-6 rounded-3xl glass-card border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white">Active Session</h3>
          <span className="text-xs text-slate-400">{user?.email || 'alex@fitai.demo'}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Signed in as <strong className="text-white">{user?.name || 'Alex Rivera'}</strong>
          </div>

          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
