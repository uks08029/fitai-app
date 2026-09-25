import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Plus,
  Flame,
  Droplet,
  Trash2,
  Calendar,
  PieChart as PieIcon,
  Apple,
  Clock,
  CheckCircle,
  X,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import AlertBanner from '../components/AlertBanner';
import { nutritionApi } from '../services/api';

export const Nutrition = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [waterLogging, setWaterLogging] = useState(false);
  const [alert, setAlert] = useState(null);

  const [formData, setFormData] = useState({
    foodName: '',
    mealType: 'Breakfast',
    servingSize: '1 serving',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
  });

  const fetchNutrition = async (date) => {
    try {
      setLoading(true);
      const res = await nutritionApi.getNutrition(date);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load nutrition data:', err);
      setAlert({ type: 'error', message: 'Could not fetch nutrition data from server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNutrition(selectedDate);
  }, [selectedDate]);

  const handleAddMeal = async (e) => {
    e.preventDefault();
    if (!formData.foodName || !formData.calories) return;

    try {
      await nutritionApi.addFoodEntry({
        ...formData,
        calories: Number(formData.calories),
        protein: Number(formData.protein) || 0,
        carbs: Number(formData.carbs) || 0,
        fats: Number(formData.fats) || 0,
        date: selectedDate,
      });

      setShowAddModal(false);
      setFormData({
        foodName: '',
        mealType: 'Breakfast',
        servingSize: '1 serving',
        calories: '',
        protein: '',
        carbs: '',
        fats: '',
      });
      setAlert({ type: 'info', message: `Added "${formData.foodName}" successfully!` });
      setTimeout(() => setAlert(null), 4000);
      fetchNutrition(selectedDate);
    } catch (err) {
      console.error('Failed to log food:', err);
      setAlert({ type: 'error', message: 'Failed to record food entry.' });
    }
  };

  const handleDeleteMeal = async (id) => {
    try {
      await nutritionApi.deleteFoodEntry(id);
      fetchNutrition(selectedDate);
    } catch (err) {
      console.error('Failed to delete meal:', err);
    }
  };

  const handleAddWater = async (amount) => {
    try {
      setWaterLogging(true);
      await nutritionApi.updateWater(amount);
      fetchNutrition(selectedDate);
    } catch (err) {
      console.error('Failed to log water:', err);
    } finally {
      setWaterLogging(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <LoadingSkeleton count={4} height="h-28" />
        <LoadingSkeleton count={2} height="h-64" />
      </div>
    );
  }

  const totals = data?.totals || { calories: 0, protein: 0, carbs: 0, fats: 0 };
  const targets = data?.targets || { calories: 2400, protein: 140, carbs: 270, fats: 67, waterMl: 3200 };
  const waterConsumed = data?.waterConsumedMl || 0;
  const entries = data?.entries || [];

  const caloriePercent = Math.min(100, Math.round((totals.calories / targets.calories) * 100));
  const proteinPercent = Math.min(100, Math.round((totals.protein / targets.protein) * 100));
  const carbsPercent = Math.min(100, Math.round((totals.carbs / targets.carbs) * 100));
  const fatsPercent = Math.min(100, Math.round((totals.fats / targets.fats) * 100));
  const waterPercent = Math.min(100, Math.round((waterConsumed / targets.waterMl) * 100));

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header & Date Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Utensils className="w-7 h-7 text-emerald-400" />
            Nutrition & Macro Tracker
          </h2>
          <p className="text-xs text-slate-400">Precision caloric intake and macronutrient balancing</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-white outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log Meal</span>
          </button>
        </div>
      </div>

      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Primary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Daily Calories"
          value={totals.calories}
          unit={`/ ${targets.calories} kcal`}
          icon={Flame}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10 border-amber-500/20"
          progressPercentage={caloriePercent}
          progressBarColor="from-amber-400 to-orange-500"
          subtext={`${targets.calories - totals.calories > 0 ? targets.calories - totals.calories : 0} kcal remaining`}
        />

        <StatCard
          title="Protein"
          value={totals.protein}
          unit={`/ ${targets.protein}g`}
          icon={Apple}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10 border-emerald-500/20"
          progressPercentage={proteinPercent}
          progressBarColor="from-emerald-400 to-teal-500"
          subtext={`${proteinPercent}% of daily goal`}
        />

        <StatCard
          title="Carbohydrates"
          value={totals.carbs}
          unit={`/ ${targets.carbs}g`}
          icon={PieIcon}
          iconColor="text-cyan-400"
          iconBg="bg-cyan-500/10 border-cyan-500/20"
          progressPercentage={carbsPercent}
          progressBarColor="from-cyan-400 to-blue-500"
          subtext={`${carbsPercent}% of daily goal`}
        />

        <StatCard
          title="Fats"
          value={totals.fats}
          unit={`/ ${targets.fats}g`}
          icon={PieIcon}
          iconColor="text-purple-400"
          iconBg="bg-purple-500/10 border-purple-500/20"
          progressPercentage={fatsPercent}
          progressBarColor="from-purple-400 to-pink-500"
          subtext={`${fatsPercent}% of daily goal`}
        />

        <StatCard
          title="Water Intake"
          value={(waterConsumed / 1000).toFixed(1)}
          unit={`/ ${(targets.waterMl / 1000).toFixed(1)} L`}
          icon={Droplet}
          iconColor="text-blue-400"
          iconBg="bg-blue-500/10 border-blue-500/20"
          progressPercentage={waterPercent}
          progressBarColor="from-blue-400 to-cyan-500"
          subtext={`${waterConsumed} ml logged`}
        />
      </div>

      {/* Quick Water Logging & Macro Ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Water Hydration Quick Logger */}
        <div className="p-6 rounded-3xl glass-card border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplet className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold text-white">Hydration Station</h3>
            </div>
            <span className="text-xs text-blue-400 font-semibold">{waterPercent}% Target</span>
          </div>

          <p className="text-xs text-slate-300">
            Optimal hydration enhances athletic performance, cognitive focus, and nutrient delivery.
          </p>

          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${waterPercent}%` }}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => handleAddWater(250)}
              disabled={waterLogging}
              className="flex-1 py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+250 ml (Glass)</span>
            </button>
            <button
              onClick={() => handleAddWater(500)}
              disabled={waterLogging}
              className="flex-1 py-2.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+500 ml (Bottle)</span>
            </button>
          </div>
        </div>

        {/* Macronutrient Distribution Summary */}
        <div className="p-6 rounded-3xl glass-card border border-slate-800/80 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Macro Caloric Energy Ratio</h3>
            </div>
            <span className="text-xs text-slate-400">Total: {totals.calories} kcal</span>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Protein Energy</span>
              <p className="text-xl font-extrabold text-white">{totals.protein * 4} kcal</p>
              <p className="text-xs text-slate-400">
                {totals.calories > 0 ? Math.round(((totals.protein * 4) / totals.calories) * 100) : 0}% of total
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 space-y-1">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Carb Energy</span>
              <p className="text-xl font-extrabold text-white">{totals.carbs * 4} kcal</p>
              <p className="text-xs text-slate-400">
                {totals.calories > 0 ? Math.round(((totals.carbs * 4) / totals.calories) * 100) : 0}% of total
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-1">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Fat Energy</span>
              <p className="text-xl font-extrabold text-white">{totals.fats * 9} kcal</p>
              <p className="text-xs text-slate-400">
                {totals.calories > 0 ? Math.round(((totals.fats * 9) / totals.calories) * 100) : 0}% of total
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Meals Log Section Grouped by Type */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            Today's Logged Meals
          </h3>
          <span className="text-xs text-slate-400">{entries.length} items logged</span>
        </div>

        {entries.length === 0 ? (
          <div className="p-12 text-center rounded-3xl glass-card border border-slate-800/80 space-y-3">
            <Utensils className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="text-base font-bold text-white">No meals recorded for this date</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Track your caloric balance by logging what you eat. Click "Log Meal" to add your first food entry.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Log Food Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mealTypes.map((type) => {
              const mealsOfType = entries.filter((e) => e.mealType?.toLowerCase() === type.toLowerCase());
              if (mealsOfType.length === 0) return null;
              const typeCalories = mealsOfType.reduce((s, m) => s + (Number(m.calories) || 0), 0);

              return (
                <div key={type} className="p-5 rounded-3xl glass-card border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <span className="font-bold text-white text-sm tracking-wide">{type}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {typeCalories} kcal
                    </span>
                  </div>

                  <div className="space-y-2">
                    {mealsOfType.map((meal) => (
                      <div
                        key={meal._id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-white">{meal.foodName}</p>
                          <p className="text-[11px] text-slate-400">
                            {meal.servingSize} • P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fats}g
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-200">{meal.calories} kcal</span>
                          <button
                            onClick={() => handleDeleteMeal(meal._id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Meal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-card rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Log Food Entry</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMeal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Food / Dish Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Grilled Chicken Breast & Brown Rice"
                  value={formData.foodName}
                  onChange={(e) => setFormData({ ...formData, foodName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Meal Category</label>
                  <select
                    value={formData.mealType}
                    onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-slate-900"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Snacks">Snacks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Serving Size</label>
                  <input
                    type="text"
                    placeholder="e.g., 200g, 1 bowl"
                    value={formData.servingSize}
                    onChange={(e) => setFormData({ ...formData, servingSize: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g., 450"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    placeholder="e.g., 40"
                    value={formData.protein}
                    onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    placeholder="e.g., 45"
                    value={formData.carbs}
                    onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fats (g)</label>
                  <input
                    type="number"
                    placeholder="e.g., 12"
                    value={formData.fats}
                    onChange={(e) => setFormData({ ...formData, fats: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all"
                >
                  Save Food Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Nutrition;
