import React, { useState, useEffect } from 'react';
import {
  Scale,
  Flame,
  Dumbbell,
  Zap,
  TrendingUp,
  Heart,
  Activity,
  Droplet,
  Footprints,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { dashboardApi, nutritionApi, workoutApi } from '../services/api';
import { useWebSocket } from '../context/WebSocketContext';
import { useAuth } from '../context/AuthContext';

export const Dashboard = () => {
  const { user } = useAuth();
  const { currentReading, isConnected } = useWebSocket();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [waterLogging, setWaterLogging] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardApi.getDashboardData();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('[Dashboard] Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleQuickAddWater = async (amount) => {
    try {
      setWaterLogging(true);
      await nutritionApi.updateWater(amount);
      await fetchDashboard();
    } catch (e) {
      console.error('Failed to log water:', e);
    } finally {
      setWaterLogging(false);
    }
  };

  const handleToggleTodayWorkout = async () => {
    if (!data?.todayWorkout) return;
    try {
      await workoutApi.updateWorkout(data.todayWorkout.id, {
        completed: !data.todayWorkout.completed,
      });
      fetchDashboard();
    } catch (e) {
      console.error('Failed to toggle workout:', e);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <LoadingSkeleton count={4} height="h-28" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <LoadingSkeleton count={2} height="h-64" className="lg:col-span-2" />
          <LoadingSkeleton count={1} height="h-64" />
        </div>
      </div>
    );
  }

  const cards = data?.summaryCards || {};
  const nutrition = data?.nutritionBreakdown || {};
  const todayWorkout = data?.todayWorkout;
  const weeklyChartData = data?.weeklyChartData || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 glass-card border border-slate-700/60 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-cyan-950/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Health Monitor Active</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="gradient-text-cyan">{user?.name?.split(' ')[0] || 'Athlete'}</span>
            </h2>
            <p className="text-sm text-slate-400 max-w-xl">
              You are currently on a <span className="text-cyan-300 font-semibold">{cards.workoutStreak?.days || 4}-day streak</span>! Daily caloric balance is on track for your muscular hypertrophy target.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/ai-coach"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02]"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Ask AI Coach</span>
            </Link>
            <Link
              to="/live-health"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card hover:bg-slate-800/80 text-white font-semibold text-sm transition-all"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Live Health</span>
            </Link>
          </div>
        </div>

        {/* Ambient background blur circle */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Current Weight"
          value={cards.currentWeight?.value || 74.5}
          unit="kg"
          icon={Scale}
          iconColor="text-cyan-400"
          iconBg="bg-cyan-500/10 border-cyan-500/20"
          subtext={`Target: ${cards.currentWeight?.target || 78.0} kg`}
          badge="-0.3 kg this week"
          badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        />

        <StatCard
          title="Daily Calories"
          value={cards.dailyCalories?.consumed || 0}
          unit={`/ ${cards.dailyCalories?.target || 2400} kcal`}
          icon={Flame}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10 border-amber-500/20"
          progressPercentage={cards.dailyCalories?.percentage || 0}
          progressBarColor="from-amber-400 to-rose-500"
          subtext={`${cards.dailyCalories?.remaining || 0} kcal remaining`}
        />

        <StatCard
          title="Protein Intake"
          value={`${cards.protein?.consumed || 0}g`}
          unit={`/ ${cards.protein?.target || 140}g`}
          icon={TrendingUp}
          iconColor="text-purple-400"
          iconBg="bg-purple-500/10 border-purple-500/20"
          progressPercentage={cards.protein?.percentage || 0}
          progressBarColor="from-purple-400 to-indigo-500"
          subtext={`${cards.protein?.remaining || 0}g remaining`}
        />

        <StatCard
          title="Workout Streak"
          value={cards.workoutStreak?.days || 4}
          unit="Days"
          icon={Dumbbell}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10 border-emerald-500/20"
          badge="Active Streak 🔥"
          badgeColor="bg-amber-500/10 text-amber-400 border-amber-500/20"
          subtext="Keep going to maintain momentum"
        />
      </div>

      {/* Main Grid: Weekly Chart & Live Telemetry Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Weight & Calorie Chart (Recharts) */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-card border border-slate-800/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Weekly Progress Trajectory
              </h3>
              <p className="text-xs text-slate-400">Weight (kg) and Calorie intake correlation over past 7 days</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Weight
              </span>
              <span className="flex items-center gap-1.5 text-purple-400">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> Calories
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00f2fe" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="calorieGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis yAxisId="left" stroke="#64748b" fontSize={11} domain={['dataMin - 0.5', 'dataMax + 0.5']} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={11} domain={[1500, 3200]} hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="weight"
                  name="Weight (kg)"
                  stroke="#00f2fe"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#weightGrad)"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="calories"
                  name="Calories (kcal)"
                  stroke="#a855f7"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#calorieGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Health Snapshot Card */}
        <div className="p-6 rounded-3xl glass-card border border-slate-800/80 flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-heart" />
                Live Sensor Telemetry
              </h3>
              <p className="text-xs text-slate-400">Streamed via WebSockets</p>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                isConnected
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
              }`}
            >
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>

          {/* Real-time Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/40 space-y-1">
              <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold">
                <Heart className="w-3.5 h-3.5 fill-rose-500/50" />
                <span>Heart Rate</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white">{currentReading.heartRate}</span>
                <span className="text-[11px] text-slate-400">BPM</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold">{currentReading.status?.heartRate || 'Normal'}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/40 space-y-1">
              <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-semibold">
                <Activity className="w-3.5 h-3.5" />
                <span>SpO₂</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white">{currentReading.spo2}%</span>
                <span className="text-[11px] text-slate-400">O₂</span>
              </div>
              <span className="text-[10px] text-cyan-400 font-semibold">{currentReading.status?.spo2 || 'Optimal'}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/40 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
                <span>🌡️ Temp</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white">{currentReading.temperature}°C</span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">Normal</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/40 space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-semibold">
                <Footprints className="w-3.5 h-3.5" />
                <span>Daily Steps</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white">{currentReading.steps?.toLocaleString()}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">
                {Math.round((currentReading.steps / 10000) * 100)}% goal
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800/60">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5 text-cyan-400" /> Water Intake
              </span>
              <span className="font-semibold text-white">
                {nutrition.water?.consumedMl || 2600} / {nutrition.water?.targetMl || 3200} ml
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={waterLogging}
                onClick={() => handleQuickAddWater(250)}
                className="flex-1 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 text-xs font-bold transition-all"
              >
                +250 ml
              </button>
              <button
                disabled={waterLogging}
                onClick={() => handleQuickAddWater(500)}
                className="flex-1 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-xs font-bold transition-all"
              >
                +500 ml
              </button>
            </div>
          </div>

          <Link
            to="/live-health"
            className="w-full py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-200 text-xs font-bold text-center border border-slate-700/50 flex items-center justify-center gap-1 transition-all"
          >
            <span>Open Telemetry Console</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Bottom Grid: Today's Workout & Today's Nutrition Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Workout Card */}
        <div className="p-6 rounded-3xl glass-card border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-purple-400" />
                Today's Scheduled Workout
              </h3>
              <p className="text-xs text-slate-400">Targeting hypertrophy and core strength</p>
            </div>
            {todayWorkout && (
              <button
                onClick={handleToggleTodayWorkout}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                  todayWorkout.completed
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{todayWorkout.completed ? 'Completed' : 'Mark Done'}</span>
              </button>
            )}
          </div>

          {todayWorkout ? (
            <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/40 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-bold text-white">{todayWorkout.name}</h4>
                  <p className="text-xs text-slate-400 font-medium">
                    Category: <span className="text-purple-300 font-semibold">{todayWorkout.category}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-amber-400">~{todayWorkout.caloriesBurned} kcal</span>
                  <p className="text-[11px] text-slate-400">{todayWorkout.duration} mins</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-300 pt-2 border-t border-slate-800/60">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{todayWorkout.duration} Minutes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5 text-slate-400" />
                  <span>{todayWorkout.exerciseCount} Exercises</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              No workout logged yet for today. Use the AI Workout generator to create one!
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Link
              to="/workout"
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View Full Workout Log & Exercises</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Today's Meals & Nutrition Summary */}
        <div className="p-6 rounded-3xl glass-card border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                Today's Nutrition Intake
              </h3>
              <p className="text-xs text-slate-400">Target: {nutrition.calories?.target || 2400} kcal</p>
            </div>
            <Link
              to="/nutrition"
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Log Food</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Macro Progress Bars */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-slate-800/30 border border-slate-700/40 space-y-1">
              <span className="text-[10px] font-bold text-purple-400 tracking-wider uppercase">Protein</span>
              <p className="text-lg font-extrabold text-white">
                {nutrition.protein?.consumed || 0}g
                <span className="text-xs font-normal text-slate-400"> / {nutrition.protein?.target || 140}g</span>
              </p>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${Math.min(100, ((nutrition.protein?.consumed || 0) / (nutrition.protein?.target || 140)) * 100)}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-800/30 border border-slate-700/40 space-y-1">
              <span className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase">Carbs</span>
              <p className="text-lg font-extrabold text-white">
                {nutrition.carbs?.consumed || 0}g
                <span className="text-xs font-normal text-slate-400"> / {nutrition.carbs?.target || 250}g</span>
              </p>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full"
                  style={{ width: `${Math.min(100, ((nutrition.carbs?.consumed || 0) / (nutrition.carbs?.target || 250)) * 100)}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-800/30 border border-slate-700/40 space-y-1">
              <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase">Fats</span>
              <p className="text-lg font-extrabold text-white">
                {nutrition.fats?.consumed || 0}g
                <span className="text-xs font-normal text-slate-400"> / {nutrition.fats?.target || 65}g</span>
              </p>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${Math.min(100, ((nutrition.fats?.consumed || 0) / (nutrition.fats?.target || 65)) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Meals list */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {data?.todayMeals && data.todayMeals.length > 0 ? (
              data.todayMeals.map((meal) => (
                <div
                  key={meal._id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/20 border border-slate-800 text-xs"
                >
                  <div className="truncate mr-2">
                    <p className="font-semibold text-white truncate">{meal.foodName}</p>
                    <p className="text-[11px] text-slate-400">
                      {meal.mealType} • {meal.protein}g protein
                    </p>
                  </div>
                  <span className="font-bold text-amber-400 whitespace-nowrap">{meal.calories} kcal</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">
                No food logged yet today. Click "Log Food" above to record your first meal!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
