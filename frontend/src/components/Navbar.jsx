import React, { useState } from 'react';
import { Menu, Heart, Activity, Bell, Wifi, WifiOff, AlertTriangle, ShieldCheck, X } from 'lucide-react';
import { useWebSocket } from '../context/WebSocketContext';

export const Navbar = ({ onOpenSidebar, pageTitle }) => {
  const { isConnected, currentReading, alerts, clearAlert } = useWebSocket();
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 py-3.5 bg-[#0a0f1d]/80 backdrop-blur-xl border-b border-slate-800/80">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/50 border border-slate-700/50 lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            {pageTitle || 'Dashboard'}
          </h1>
          <p className="text-xs text-slate-400 font-medium hidden sm:block">{formattedDate} • FitAI Active Monitor</p>
        </div>
      </div>

      {/* Right: Live Telemetry Ticker & System Badges */}
      <div className="flex items-center gap-3">
        {/* Live Sensor Mini Pill */}
        <div className="hidden md:flex items-center gap-4 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs shadow-inner">
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-heart" />
            <span className="font-bold text-white tracking-wide">{currentReading.heartRate}</span>
            <span className="text-[10px] text-slate-400">BPM</span>
          </div>

          <div className="w-px h-3 bg-slate-800" />

          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold text-white tracking-wide">{currentReading.spo2}%</span>
            <span className="text-[10px] text-slate-400">SpO₂</span>
          </div>

          <div className="w-px h-3 bg-slate-800" />

          {/* Connection Status Badge */}
          <div className="flex items-center gap-1.5">
            {isConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-semibold text-emerald-400">WS Live</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span className="text-[11px] font-semibold text-rose-400">Offline</span>
              </>
            )}
          </div>
        </div>

        {/* Demo Indicator Pill */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40 text-[11px] text-cyan-300">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Demo Sensor Simulator</span>
        </div>

        {/* Alert Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
            className="relative p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 transition-colors"
            title="Threshold Alerts"
          >
            <Bell className="w-4 h-4" />
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-lg shadow-rose-500/50 animate-bounce">
                {alerts.length}
              </span>
            )}
          </button>

          {/* Alerts Dropdown Modal */}
          {showAlertsDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-card border border-slate-700/80 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-white">Live Health Alerts</h4>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Demo Safety Monitor</span>
              </div>

              <div className="py-2 space-y-2 max-h-64 overflow-y-auto">
                {alerts.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No active threshold alerts. All vitals nominal.</p>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs"
                    >
                      <div className="space-y-0.5">
                        <p className="font-semibold text-amber-300">{alert.message}</p>
                        <p className="text-[10px] text-slate-400">{new Date(alert.time).toLocaleTimeString()}</p>
                      </div>
                      <button
                        onClick={() => clearAlert(alert.id)}
                        className="text-slate-400 hover:text-white p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 italic">
                *Demo alert system for software evaluation only. Not medical diagnosis.
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
