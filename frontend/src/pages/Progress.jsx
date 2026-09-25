import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Scale,
  Plus,
  Sliders,
  Sparkles,
  Calendar,
  Flame,
  Footprints,
  Droplet,
  Info,
  CheckCircle,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';
import StatCard from '../components/StatCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import AlertBanner from '../components/AlertBanner';
import { progressApi } from '../services/api';

export const Progress = () => {
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [alert, setAlert] = useState(null);

  // What-If Simulation State
  const [simCalories, setSimCalories] = useState(2100);
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState(null);

  // New Record Form
  const [formData, setFormData] = useState({
    weight: 74.5,
    calories: 2350,
    protein: 150,
    steps: 10200,
    waterMl: 3000,
    date: new Date().toISOString().split('T')[0],
  });

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const res = await progressApi.getProgress(30);
      if (res.data.success) {
        setProgressData(res.data);
      }
    } catch (err) {
      console.error('Failed to load progress records:', err);
      setAlert({ type: 'error', message: 'Failed to retrieve progress records.' });
    } finally {
      setLoading(false);
    }
  };

  const runSimulation = async (cals) => {
    try {
      setSimLoading(true);
      const res = await progressApi.simulateWhatIf(cals);
      if (res.data.success) {
        setSimResult(res.data);
      }
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setSimLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
    runSimulation(2100);
  }, []);

  const handleAddEntry = async (e) => {
    e.preventDefault();
    try {
      await progressApi.addProgressEntry({
        ...formData,
        weight: Number(formData.weight),
        calories: Number(formData.calories),
        protein: Number(formData.protein),
        steps: Number(formData.steps),
        waterMl: Number(formData.waterMl),
      });

      setShowAddModal(false);
      setAlert({ type: 'info', message: 'Biometric progress recorded successfully!' });
      setTimeout(() => setAlert(null), 3000);
      fetchProgress();
      runSimulation(simCalories);
    } catch (err) {
      console.error('Failed to add entry:', err);
      setAlert({ type: 'error', message: 'Failed to save progress entry.' });
    }
  };

  if (loading && !progressData) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <LoadingSkeleton count={4} height="h-28" />
        <LoadingSkeleton count={2} height="h-72" />
      </div>
    );
  }

  const records = progressData?.records || [];
  const currentWeight = progressData?.currentWeight || 74.5;
  const targetWeight = progressData?.targetWeight || 78.0;
  const weightDiff = (targetWeight - currentWeight).toFixed(1);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-cyan-400" />
            Biometric Progress & Projections
          </h2>
          <p className="text-xs text-slate-400">Track body composition evolution and project future thermodynamic trajectories</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Progress Entry</span>
        </button>
      </div>

      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Weight"
          value={currentWeight}
          unit="kg"
          icon={Scale}
          iconColor="text-cyan-400"
          iconBg="bg-cyan-500/10 border-cyan-500/20"
          subtext="Last updated today"
        />

        <StatCard
          title="Target Goal"
          value={targetWeight}
          unit="kg"
          icon={TrendingUp}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10 border-emerald-500/20"
          subtext={`${Math.abs(weightDiff)} kg ${weightDiff > 0 ? 'to gain' : 'to lose'}`}
        />

        <StatCard
          title="Logged Days"
          value={records.length}
          unit="entries"
          icon={Calendar}
          iconColor="text-purple-400"
          iconBg="bg-purple-500/10 border-purple-500/20"
          subtext="Consistent check-ins"
        />

        <StatCard
          title="Avg Step Count"
          value={
            records.length > 0
              ? Math.round(records.reduce((s, r) => s + (r.steps || 0), 0) / records.length).toLocaleString()
              : '9,450'
          }
          unit="steps/day"
          icon={Footprints}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10 border-amber-500/20"
          subtext="Activity baseline"
        />
      </div>

      {/* Historical Weight Trend Chart */}
      <div className="p-6 rounded-3xl glass-card border border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-base font-bold text-white">Body Mass Trajectory (Past 30 Days)</h3>
            <p className="text-xs text-slate-400">Recorded weigh-ins with goal reference marker</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Measured Weight
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-0.5 bg-emerald-400" /> Target ({targetWeight} kg)
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={records}>
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#00f2fe" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="#64748b" tick={{ fontSize: 11 }} unit="kg" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#f8fafc',
                }}
              />
              <ReferenceLine y={targetWeight} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Target', fill: '#10b981', fontSize: 10 }} />
              <Area type="monotone" dataKey="weight" stroke="#00f2fe" strokeWidth={3} fillOpacity={1} fill="url(#weightGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Thermodynamic "What-If" Calorie Simulator */}
      <div className="p-6 rounded-3xl glass-card border border-purple-500/30 bg-purple-950/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-900/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">"What-If" Caloric Trajectory Simulator</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  ML & PHYSICS ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Simulate weekly & 8-week bodyweight projection under any hypothetical caloric intake.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Quick Select:</span>
            <button
              onClick={() => {
                setSimCalories(1800);
                runSimulation(1800);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white"
            >
              1800 (Cut)
            </button>
            <button
              onClick={() => {
                setSimCalories(2400);
                runSimulation(2400);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white"
            >
              2400 (Maintain)
            </button>
            <button
              onClick={() => {
                setSimCalories(2800);
                runSimulation(2800);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white"
            >
              2800 (Bulk)
            </button>
          </div>
        </div>

        {/* Interactive Calorie Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">
              Hypothetical Daily Caloric Intake: <span className="text-cyan-400 font-bold text-sm">{simCalories} kcal</span>
            </label>
            <span className="text-xs text-slate-400">Baseline TDEE: {simResult?.tdee || 2600} kcal</span>
          </div>

          <input
            type="range"
            min="1200"
            max="3800"
            step="50"
            value={simCalories}
            onChange={(e) => {
              const val = Number(e.target.value);
              setSimCalories(val);
              runSimulation(val);
            }}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Simulation Metric Cards */}
        {simResult && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Daily Energy Balance</span>
              <p className={`text-xl font-extrabold ${simResult.dailyDifference < 0 ? 'text-emerald-400' : simResult.dailyDifference > 0 ? 'text-amber-400' : 'text-slate-200'}`}>
                {simResult.dailyDifference > 0 ? `+${simResult.dailyDifference}` : simResult.dailyDifference} kcal/day
              </p>
              <p className="text-[11px] text-slate-400">
                {simResult.dailyDifference < 0 ? 'Caloric Deficit' : simResult.dailyDifference > 0 ? 'Caloric Surplus' : 'Isocaloric Maintenance'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Projected Weekly Rate</span>
              <p className="text-xl font-extrabold text-white">
                {simResult.weeklyChangeKg > 0 ? `+${simResult.weeklyChangeKg}` : simResult.weeklyChangeKg} kg/wk
              </p>
              <p className="text-[11px] text-slate-400">Based on ~7,700 kcal per kg tissue</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">8-Week Projected Weight</span>
              <p className="text-xl font-extrabold text-cyan-300">
                {simResult.projection ? simResult.projection[simResult.projection.length - 1]?.simulatedWeight : currentWeight} kg
              </p>
              <p className="text-[11px] text-slate-400">
                Net change: {((simResult.projection ? simResult.projection[simResult.projection.length - 1]?.simulatedWeight : currentWeight) - currentWeight).toFixed(1)} kg
              </p>
            </div>
          </div>
        )}

        {/* Projection Chart */}
        {simResult?.projection && (
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={simResult.projection}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="week" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="#64748b" tick={{ fontSize: 11 }} unit="kg" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                  }}
                />
                <Legend />
                <Line type="monotone" name="Baseline (Stable)" dataKey="baselineWeight" stroke="#64748b" strokeDasharray="4 4" strokeWidth={2} />
                <Line type="monotone" name="Projected Trajectory" dataKey="simulatedWeight" stroke="#a855f7" strokeWidth={3} dot={{ r: 4, fill: '#a855f7' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Summary note & disclaimer */}
        {simResult && (
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200 space-y-1">
            <p className="font-semibold text-white">{simResult.summary}</p>
            <p className="text-[11px] text-slate-400 italic">{simResult.disclaimer}</p>
          </div>
        )}
      </div>

      {/* Add Progress Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-card rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Log Biometric Progress</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEntry} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Body Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Daily Steps</label>
                  <input
                    type="number"
                    value={formData.steps}
                    onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Calories Consumed</label>
                  <input
                    type="number"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={formData.protein}
                    onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Water (ml)</label>
                  <input
                    type="number"
                    value={formData.waterMl}
                    onChange={(e) => setFormData({ ...formData, waterMl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25"
                >
                  Save Progress
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Progress;
