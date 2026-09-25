import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Plus,
  Flame,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  Calendar,
  Sparkles,
  Trophy,
  Activity,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import StatCard from '../components/StatCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import AlertBanner from '../components/AlertBanner';
import { workoutApi } from '../services/api';
import { Link } from 'react-router-dom';

export const Workout = () => {
  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState([]);
  const [stats, setStats] = useState({
    weeklyCount: 0,
    streakDays: 0,
    totalMinutes: 0,
    totalCaloriesBurned: 0,
  });
  const [activeCategory, setActiveCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [alert, setAlert] = useState(null);

  const [newWorkout, setNewWorkout] = useState({
    name: '',
    category: 'Strength',
    duration: 45,
    caloriesBurned: 320,
    exercises: [
      { name: 'Barbell Bench Press', sets: 4, reps: 8, weightKg: 80, completed: false },
      { name: 'Incline Dumbbell Press', sets: 3, reps: 10, weightKg: 28, completed: false },
    ],
  });

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const res = await workoutApi.getWorkouts();
      if (res.data.success) {
        setWorkouts(res.data.workouts || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to load workouts:', err);
      setAlert({ type: 'error', message: 'Failed to retrieve workout logs from server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const handleToggleExercise = async (workoutId, exerciseIndex, currentCompleted) => {
    try {
      const res = await workoutApi.toggleExercise(workoutId, exerciseIndex, !currentCompleted);
      if (res.data.success) {
        const updatedWorkout = res.data.workout;

        // If workout completed all exercises, trigger celebration!
        if (updatedWorkout.completed && !currentCompleted) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#00f2fe', '#4facfe', '#10b981', '#f59e0b'],
          });
        }

        // Update local state
        setWorkouts((prev) =>
          prev.map((w) => (w._id === workoutId || w.id === workoutId ? { ...w, ...updatedWorkout } : w))
        );
      }
    } catch (err) {
      console.error('Failed to toggle exercise status:', err);
    }
  };

  const handleDeleteWorkout = async (id) => {
    try {
      await workoutApi.deleteWorkout(id);
      setWorkouts((prev) => prev.filter((w) => w._id !== id && w.id !== id));
      setAlert({ type: 'info', message: 'Workout routine removed.' });
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      console.error('Failed to delete workout:', err);
    }
  };

  const handleAddExerciseRow = () => {
    setNewWorkout({
      ...newWorkout,
      exercises: [
        ...newWorkout.exercises,
        { name: '', sets: 3, reps: 10, weightKg: 20, completed: false },
      ],
    });
  };

  const handleRemoveExerciseRow = (index) => {
    setNewWorkout({
      ...newWorkout,
      exercises: newWorkout.exercises.filter((_, i) => i !== index),
    });
  };

  const handleExerciseChange = (index, field, value) => {
    const updated = [...newWorkout.exercises];
    updated[index][field] = value;
    setNewWorkout({ ...newWorkout, exercises: updated });
  };

  const handleCreateWorkout = async (e) => {
    e.preventDefault();
    if (!newWorkout.name.trim()) return;

    try {
      await workoutApi.createWorkout({
        name: newWorkout.name,
        category: newWorkout.category,
        duration: Number(newWorkout.duration),
        caloriesBurned: Number(newWorkout.caloriesBurned),
        exercises: newWorkout.exercises.filter((e) => e.name.trim() !== ''),
      });

      setShowAddModal(false);
      setAlert({ type: 'info', message: `Workout "${newWorkout.name}" created!` });
      setTimeout(() => setAlert(null), 3000);
      fetchWorkouts();
    } catch (err) {
      console.error('Failed to create workout:', err);
      setAlert({ type: 'error', message: 'Failed to create new workout.' });
    }
  };

  const categories = ['All', 'Strength', 'Cardio', 'HIIT', 'Flexibility'];

  const filteredWorkouts =
    activeCategory === 'All'
      ? workouts
      : workouts.filter((w) => w.category?.toLowerCase() === activeCategory.toLowerCase());

  if (loading && workouts.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <LoadingSkeleton count={4} height="h-28" />
        <LoadingSkeleton count={3} height="h-44" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Dumbbell className="w-7 h-7 text-cyan-400" />
            Workout & Training Hub
          </h2>
          <p className="text-xs text-slate-400">Track resistance volume, aerobic output, and workout streaks</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/ai-coach"
            className="px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>AI Routine Generator</span>
          </Link>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Workout</span>
          </button>
        </div>
      </div>

      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Streak"
          value={stats.streakDays}
          unit="days"
          icon={Trophy}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10 border-amber-500/20"
          subtext="Keep the momentum going!"
          badge="CONSISTENT"
        />

        <StatCard
          title="This Week"
          value={stats.weeklyCount}
          unit="sessions"
          icon={Calendar}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10 border-emerald-500/20"
          subtext="Goal: 4+ sessions/wk"
        />

        <StatCard
          title="Training Duration"
          value={stats.totalMinutes}
          unit="mins"
          icon={Clock}
          iconColor="text-cyan-400"
          iconBg="bg-cyan-500/10 border-cyan-500/20"
          subtext="Total time invested"
        />

        <StatCard
          title="Energy Burned"
          value={stats.totalCaloriesBurned}
          unit="kcal"
          icon={Flame}
          iconColor="text-rose-400"
          iconBg="bg-rose-500/10 border-rose-500/20"
          subtext="Active training burn"
        />
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Workouts List */}
      <div className="space-y-4">
        {filteredWorkouts.length === 0 ? (
          <div className="p-12 text-center rounded-3xl glass-card border border-slate-800/80 space-y-3">
            <Dumbbell className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="text-base font-bold text-white">No workouts found in this category</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Plan your next training session or log an exercise routine to track your progress.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Custom Workout
            </button>
          </div>
        ) : (
          filteredWorkouts.map((workout) => {
            const wId = workout._id || workout.id;
            const completedExercises = workout.exercises?.filter((e) => e.completed).length || 0;
            const totalExercises = workout.exercises?.length || 0;
            const progressPercent = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

            return (
              <div
                key={wId}
                className="p-6 rounded-3xl glass-card border border-slate-800/80 hover:border-slate-700/80 transition-all space-y-4"
              >
                {/* Workout Top Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-2xl ${
                        workout.completed
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      }`}
                    >
                      <Dumbbell className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{workout.name}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {workout.category}
                        </span>
                        {workout.completed && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            COMPLETED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {workout.duration} mins
                        </span>
                        <span className="flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-rose-400" /> {workout.caloriesBurned} kcal
                        </span>
                        <span>{new Date(workout.date || Date.now()).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-300">
                        {completedExercises} / {totalExercises} Done
                      </p>
                      <div className="w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteWorkout(wId)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                      title="Delete workout"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Exercises Check-off List */}
                {workout.exercises && workout.exercises.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {workout.exercises.map((exercise, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleToggleExercise(wId, idx, exercise.completed)}
                        className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                          exercise.completed
                            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate mr-2">
                          {exercise.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-500 flex-shrink-0" />
                          )}
                          <div className="truncate">
                            <p
                              className={`text-xs font-semibold truncate ${
                                exercise.completed ? 'line-through text-slate-400' : 'text-white'
                              }`}
                            >
                              {exercise.name}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {exercise.sets} sets × {exercise.reps} reps
                              {exercise.weightKg > 0 && ` • ${exercise.weightKg} kg`}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            exercise.completed
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {exercise.completed ? 'Done' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Workout Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg glass-card rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Log Custom Workout</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkout} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Workout Routine Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Heavy Push Hypertrophy"
                  value={newWorkout.name}
                  onChange={(e) => setNewWorkout({ ...newWorkout, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={newWorkout.category}
                    onChange={(e) => setNewWorkout({ ...newWorkout, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-slate-900"
                  >
                    <option value="Strength">Strength</option>
                    <option value="Cardio">Cardio</option>
                    <option value="HIIT">HIIT</option>
                    <option value="Flexibility">Flexibility</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={newWorkout.duration}
                    onChange={(e) => setNewWorkout({ ...newWorkout, duration: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Est. Calories</label>
                  <input
                    type="number"
                    value={newWorkout.caloriesBurned}
                    onChange={(e) => setNewWorkout({ ...newWorkout, caloriesBurned: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              {/* Dynamic Exercise Rows */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white">Exercise Breakdown</label>
                  <button
                    type="button"
                    onClick={handleAddExerciseRow}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Exercise
                  </button>
                </div>

                <div className="space-y-2">
                  {newWorkout.exercises.map((ex, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                      <input
                        type="text"
                        placeholder="Exercise name"
                        value={ex.name}
                        onChange={(e) => handleExerciseChange(idx, 'name', e.target.value)}
                        className="flex-2 w-full px-2 py-1 rounded-lg glass-input text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Sets"
                        value={ex.sets}
                        onChange={(e) => handleExerciseChange(idx, 'sets', e.target.value)}
                        className="w-14 px-2 py-1 rounded-lg glass-input text-xs text-center"
                        title="Sets"
                      />
                      <input
                        type="number"
                        placeholder="Reps"
                        value={ex.reps}
                        onChange={(e) => handleExerciseChange(idx, 'reps', e.target.value)}
                        className="w-14 px-2 py-1 rounded-lg glass-input text-xs text-center"
                        title="Reps"
                      />
                      <input
                        type="number"
                        placeholder="kg"
                        value={ex.weightKg}
                        onChange={(e) => handleExerciseChange(idx, 'weightKg', e.target.value)}
                        className="w-16 px-2 py-1 rounded-lg glass-input text-xs text-center"
                        title="Weight in kg"
                      />
                      {newWorkout.exercises.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveExerciseRow(idx)}
                          className="p-1 text-slate-500 hover:text-rose-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
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
                  Save Workout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workout;
