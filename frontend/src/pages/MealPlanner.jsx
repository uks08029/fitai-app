import React, { useState, useEffect } from 'react';
import {
  ChefHat,
  Sparkles,
  Flame,
  Apple,
  Clock,
  CheckCircle,
  Plus,
  Zap,
  Info,
  Layers,
  Utensils,
  Cpu,
} from 'lucide-react';
import { aiApi, mlApi, nutritionApi, profileApi } from '../services/api';
import AlertBanner from '../components/AlertBanner';
import LoadingSkeleton from '../components/LoadingSkeleton';

export const MealPlanner = () => {
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [mealPlan, setMealPlan] = useState(null);
  const [alert, setAlert] = useState(null);
  const [loggedMeals, setLoggedMeals] = useState({});

  // Plan Generation Inputs
  const [params, setParams] = useState({
    calorieTarget: 2400,
    proteinTarget: 140,
    dietaryPreference: 'Non-Vegetarian',
    goal: 'Build Muscle',
  });

  const [mlPredicted, setMlPredicted] = useState(null);

  useEffect(() => {
    const loadProfileAndMl = async () => {
      try {
        setProfileLoading(true);
        const pRes = await profileApi.getProfile();
        if (pRes.data.success) {
          const prof = pRes.data.profile;
          setParams({
            calorieTarget: prof.calorieTarget || 2400,
            proteinTarget: prof.proteinTarget || 140,
            dietaryPreference: prof.dietaryPreference || 'Non-Vegetarian',
            goal: prof.goal || 'Build Muscle',
          });

          // Fetch ML recommendation
          try {
            const mlRes = await mlApi.predictCalories({
              age: prof.age || 24,
              gender: prof.gender || 'male',
              height: prof.height || 178,
              weight: prof.weight || 74.5,
              activity_level: prof.activityLevel || 'Moderate',
              goal: prof.goal || 'Build Muscle',
            });
            if (mlRes.data) {
              setMlPredicted(mlRes.data);
            }
          } catch (e) {
            console.warn('ML prediction fetch failed:', e);
          }
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfileAndMl();
  }, []);

  const handleGeneratePlan = async () => {
    try {
      setLoading(true);
      setAlert(null);
      const res = await aiApi.generateMealPlan(params);
      if (res.data.success && res.data.mealPlan) {
        setMealPlan(res.data.mealPlan);
        setLoggedMeals({});
      }
    } catch (err) {
      console.error('Failed to generate meal plan:', err);
      setAlert({
        type: 'error',
        message: 'Could not generate meal plan. Please ensure backend server is active.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogToTracker = async (meal, index) => {
    try {
      await nutritionApi.addFoodEntry({
        foodName: meal.name,
        mealType: meal.mealType,
        servingSize: '1 AI planned portion',
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fats: meal.fats,
      });
      setLoggedMeals((prev) => ({ ...prev, [index]: true }));
      setAlert({ type: 'info', message: `"${meal.name}" added to today's nutrition log!` });
      setTimeout(() => setAlert(null), 3500);
    } catch (err) {
      console.error('Failed to log meal:', err);
    }
  };

  const handleUseMlCalories = () => {
    if (mlPredicted?.predicted_calories) {
      setParams((prev) => ({
        ...prev,
        calorieTarget: mlPredicted.predicted_calories,
        proteinTarget: mlPredicted.macros?.protein || prev.proteinTarget,
      }));
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ChefHat className="w-7 h-7 text-amber-400" />
            AI Dynamic Meal Planner
          </h2>
          <p className="text-xs text-slate-400">
            Generate dietitian-calibrated meal schedules aligned with your ML biometric caloric target
          </p>
        </div>

        {mlPredicted && (
          <div className="flex items-center gap-2 p-2 px-3 rounded-2xl bg-cyan-950/40 border border-cyan-800/40 text-xs text-cyan-300">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>ML Engine Suggests: <strong>{mlPredicted.predicted_calories} kcal</strong></span>
            <button
              onClick={handleUseMlCalories}
              className="ml-2 px-2 py-0.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold border border-cyan-500/30"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Plan Configuration Card */}
      <div className="p-6 rounded-3xl glass-card border border-slate-800/80 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Target & Dietary Preferences</h3>
          </div>
          <span className="text-xs text-slate-400">Customizable constraints</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Daily Caloric Target (kcal)</label>
            <input
              type="number"
              value={params.calorieTarget}
              onChange={(e) => setParams({ ...params, calorieTarget: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Protein Target (grams)</label>
            <input
              type="number"
              value={params.proteinTarget}
              onChange={(e) => setParams({ ...params, proteinTarget: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Dietary Pattern</label>
            <select
              value={params.dietaryPreference}
              onChange={(e) => setParams({ ...params, dietaryPreference: e.target.value })}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-slate-900"
            >
              <option value="Non-Vegetarian">Non-Vegetarian</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Vegan">Vegan</option>
              <option value="Keto">Keto</option>
              <option value="High-Protein">High-Protein</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Physique Goal</label>
            <select
              value={params.goal}
              onChange={(e) => setParams({ ...params, goal: e.target.value })}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-slate-900"
            >
              <option value="Build Muscle">Build Muscle</option>
              <option value="Lose Weight">Lose Weight</option>
              <option value="Maintain">Maintain</option>
              <option value="Gain Weight">Gain Weight</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGeneratePlan}
          disabled={loading}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all"
        >
          {loading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Generating Calibrated Plan...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate AI Meal Plan</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Meal Plan Display */}
      {mealPlan && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Plan Overview Banner */}
          <div className="p-6 rounded-3xl glass-card border border-amber-500/30 bg-amber-950/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {mealPlan.dietaryPreference || params.dietaryPreference}
                </span>
                <h3 className="text-xl font-extrabold text-white mt-1">{mealPlan.title || 'AI Optimized Day Plan'}</h3>
                <p className="text-xs text-slate-300">Engineered to hit {mealPlan.targetCalories || params.calorieTarget} kcal</p>
              </div>

              {mealPlan.macroSplit && (
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center min-w-[70px]">
                    <span className="text-[10px] text-slate-400 uppercase">Protein</span>
                    <p className="text-sm font-bold text-emerald-400">{mealPlan.macroSplit.protein}g</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center min-w-[70px]">
                    <span className="text-[10px] text-slate-400 uppercase">Carbs</span>
                    <p className="text-sm font-bold text-cyan-400">{mealPlan.macroSplit.carbs}g</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center min-w-[70px]">
                    <span className="text-[10px] text-slate-400 uppercase">Fats</span>
                    <p className="text-sm font-bold text-purple-400">{mealPlan.macroSplit.fats}g</p>
                  </div>
                </div>
              )}
            </div>

            {/* Daily Tips */}
            {mealPlan.dailyTips && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>{mealPlan.dailyTips}</span>
              </div>
            )}
          </div>

          {/* Meals Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mealPlan.meals?.map((meal, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl glass-card border border-slate-800/80 hover:border-slate-700/80 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Meal Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">{meal.mealType}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-white border border-slate-700">
                      {meal.calories} kcal
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white">{meal.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                      <span>P: <strong className="text-emerald-400">{meal.protein}g</strong></span>
                      <span>C: <strong className="text-cyan-400">{meal.carbs}g</strong></span>
                      <span>F: <strong className="text-purple-400">{meal.fats}g</strong></span>
                    </p>
                  </div>

                  {/* Ingredients */}
                  {meal.ingredients && meal.ingredients.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-400">Ingredients:</span>
                      <ul className="text-xs text-slate-300 list-disc pl-4 space-y-0.5">
                        {meal.ingredients.map((ing, i) => (
                          <li key={i}>{ing}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Instructions */}
                  {meal.recipeQuickInstructions && (
                    <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                      <strong className="text-white block mb-0.5">Preparation:</strong>
                      {meal.recipeQuickInstructions}
                    </div>
                  )}
                </div>

                {/* Log Meal Button */}
                <div className="pt-4 border-t border-slate-800">
                  <button
                    onClick={() => handleLogToTracker(meal, idx)}
                    disabled={loggedMeals[idx]}
                    className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      loggedMeals[idx]
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {loggedMeals[idx] ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Logged to Today's Tracker</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Log to Daily Nutrition</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanner;
