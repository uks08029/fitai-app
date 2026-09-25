import React, { useState, useEffect } from 'react';
import {
  User,
  Scale,
  Activity,
  Flame,
  Droplet,
  Save,
  Cpu,
  Sparkles,
  CheckCircle,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { profileApi, mlApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import AlertBanner from '../components/AlertBanner';

export const Profile = () => {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const [formData, setFormData] = useState({
    age: 24,
    gender: 'male',
    height: 178,
    weight: 74.5,
    targetWeight: 78.0,
    activityLevel: 'Moderate',
    goal: 'Build Muscle',
    dietaryPreference: 'Non-Vegetarian',
    dailyStepGoal: 10000,
    calorieTarget: 2450,
    proteinTarget: 150,
    waterTarget: 3200,
  });

  const [metrics, setMetrics] = useState({
    bmi: 23.51,
    bmr: 1705,
    tdee: 2643,
  });

  const [mlData, setMlData] = useState(null);
  const [mlLoading, setMlLoading] = useState(false);

  const fetchProfileAndMl = async () => {
    try {
      setLoading(true);
      const res = await profileApi.getProfile();
      if (res.data.success && res.data.profile) {
        const p = res.data.profile;
        setFormData({
          age: p.age ?? 24,
          gender: p.gender ?? 'male',
          height: p.height ?? 178,
          weight: p.weight ?? 74.5,
          targetWeight: p.targetWeight ?? 78.0,
          activityLevel: p.activityLevel ?? 'Moderate',
          goal: p.goal ?? 'Build Muscle',
          dietaryPreference: p.dietaryPreference ?? 'Non-Vegetarian',
          dailyStepGoal: p.dailyStepGoal ?? 10000,
          calorieTarget: p.calorieTarget ?? 2450,
          proteinTarget: p.proteinTarget ?? 150,
          waterTarget: p.waterTarget ?? 3200,
        });

        setMetrics({
          bmi: p.bmi ?? 23.51,
          bmr: p.bmr ?? 1705,
          tdee: p.tdee ?? 2643,
        });

        // Query ML prediction
        fetchMlPrediction({
          age: p.age,
          gender: p.gender,
          height: p.height,
          weight: p.weight,
          activity_level: p.activityLevel,
          goal: p.goal,
        });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setAlert({ type: 'error', message: 'Could not fetch profile from server.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchMlPrediction = async (inputs) => {
    try {
      setMlLoading(true);
      const res = await mlApi.predictCalories(inputs);
      if (res.data) {
        setMlData(res.data);
      }
    } catch (e) {
      console.warn('ML prediction query failed:', e);
    } finally {
      setMlLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndMl();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);
    try {
      const res = await profileApi.updateProfile(formData);
      if (res.data.success) {
        setAlert({ type: 'info', message: 'Profile and biometrics updated successfully!' });
        if (res.data.profile) {
          setMetrics({
            bmi: res.data.profile.bmi,
            bmr: res.data.profile.bmr,
            tdee: res.data.profile.tdee,
          });
        }
        await refreshProfile();
        fetchMlPrediction({
          age: formData.age,
          gender: formData.gender,
          height: formData.height,
          weight: formData.weight,
          activity_level: formData.activityLevel,
          goal: formData.goal,
        });
        setTimeout(() => setAlert(null), 4000);
      }
    } catch (err) {
      console.error('Save failed:', err);
      setAlert({ type: 'error', message: 'Failed to update profile settings.' });
    } finally {
      setSaving(false);
    }
  };

  const applyMlTargets = () => {
    if (mlData) {
      setFormData((prev) => ({
        ...prev,
        calorieTarget: mlData.predicted_calories,
        proteinTarget: mlData.macros?.protein || prev.proteinTarget,
      }));
      setAlert({
        type: 'info',
        message: `Applied ML recommended targets: ${mlData.predicted_calories} kcal & ${mlData.macros?.protein}g protein. Click "Save Changes" to confirm.`,
      });
      setTimeout(() => setAlert(null), 5000);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <LoadingSkeleton count={3} height="h-28" />
        <LoadingSkeleton count={2} height="h-64" />
      </div>
    );
  }

  const getBmiBadge = (bmi) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    if (bmi < 25.0) return { label: 'Optimal BMI', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    if (bmi < 30.0) return { label: 'Overweight', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    return { label: 'Obese', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
  };

  const bmiInfo = getBmiBadge(metrics.bmi);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <User className="w-7 h-7 text-cyan-400" />
            Biometric Profile & ML Parameters
          </h2>
          <p className="text-xs text-slate-400">
            Configure physical attributes, lifestyle factors, and view machine learning model predictions
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/25 transition-all self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
        </button>
      </div>

      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Calculated Biometric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Body Mass Index (BMI)"
          value={metrics.bmi}
          unit="kg/m²"
          icon={Activity}
          iconColor="text-cyan-400"
          iconBg="bg-cyan-500/10 border-cyan-500/20"
          badge={bmiInfo.label}
          badgeColor={bmiInfo.color}
          subtext="Height/weight ratio"
        />

        <StatCard
          title="Basal Metabolic Rate (BMR)"
          value={metrics.bmr}
          unit="kcal/day"
          icon={Flame}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10 border-amber-500/20"
          subtext="Mifflin-St Jeor formula (at complete rest)"
        />

        <StatCard
          title="Total Daily Energy (TDEE)"
          value={metrics.tdee}
          unit="kcal/day"
          icon={TrendingUp}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10 border-emerald-500/20"
          subtext={`Scaled by ${formData.activityLevel} activity`}
        />

        <StatCard
          title="Target Daily Calories"
          value={formData.calorieTarget}
          unit="kcal/day"
          icon={Sparkles}
          iconColor="text-purple-400"
          iconBg="bg-purple-500/10 border-purple-500/20"
          subtext={`Goal: ${formData.goal}`}
        />
      </div>

      {/* Machine Learning Model Prediction Panel */}
      {mlData && (
        <div className="p-6 rounded-3xl glass-card border border-cyan-500/30 bg-cyan-950/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-900/40 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">Random Forest ML Caloric Regression</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {mlData.model || 'RandomForestRegressor'}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  {mlData.source} • Trained on 3,000 empirical athlete & metabolic samples
                </p>
              </div>
            </div>

            <button
              onClick={applyMlTargets}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-cyan-500/20 self-start sm:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apply ML Recommended Targets</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ML Predicted Calorie</span>
              <p className="text-xl font-black text-cyan-300">{mlData.predicted_calories} kcal</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Confidence: {mlData.confidence_or_error_metric || '±98.25 kcal (MAE)'}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Model R² Accuracy</span>
              <p className="text-xl font-black text-emerald-400">{mlData.r2_score || '0.9553'}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">High variance explained (95.5%)</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Protein Target</span>
              <p className="text-xl font-black text-white">{mlData.macros?.protein || 149}g</p>
              <p className="text-[11px] text-slate-400 mt-0.5">2.0g/kg bodyweight ratio</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Formula vs ML Delta</span>
              <p className="text-xl font-black text-amber-400">
                {mlData.predicted_calories - formData.calorieTarget > 0 ? `+${mlData.predicted_calories - formData.calorieTarget}` : mlData.predicted_calories - formData.calorieTarget} kcal
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Difference from custom target</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-3xl glass-card border border-slate-800/80 space-y-6">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white">Biometric Parameters</h3>
          <p className="text-xs text-slate-400">Accurate metrics allow precise TDEE and calorie predictions</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Age</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => handleChange('age', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Biological Sex / Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-slate-900"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Height (cm)</label>
            <input
              type="number"
              value={formData.height}
              onChange={(e) => handleChange('height', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Current Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              value={formData.weight}
              onChange={(e) => handleChange('weight', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Target Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              value={formData.targetWeight}
              onChange={(e) => handleChange('targetWeight', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Activity Level</label>
            <select
              value={formData.activityLevel}
              onChange={(e) => handleChange('activityLevel', e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-slate-900"
            >
              <option value="Sedentary">Sedentary (desk job, minimal exercise)</option>
              <option value="Light">Light (exercise 1-3 days/week)</option>
              <option value="Moderate">Moderate (exercise 3-5 days/week)</option>
              <option value="Active">Active (exercise 6-7 days/week)</option>
              <option value="Very Active">Very Active (twice daily/physical labor)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Fitness & Physique Goal</label>
            <select
              value={formData.goal}
              onChange={(e) => handleChange('goal', e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-slate-900"
            >
              <option value="Build Muscle">Build Muscle (Lean Surplus)</option>
              <option value="Lose Weight">Lose Weight (Fat Cut)</option>
              <option value="Maintain">Maintain Composition</option>
              <option value="Gain Weight">Gain Mass</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Dietary Preference</label>
            <select
              value={formData.dietaryPreference}
              onChange={(e) => handleChange('dietaryPreference', e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-slate-900"
            >
              <option value="Non-Vegetarian">Non-Vegetarian</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Vegan">Vegan</option>
              <option value="Keto">Keto</option>
              <option value="High-Protein">High-Protein</option>
            </select>
          </div>
        </div>

        {/* Goals & Targets Section */}
        <div className="border-t border-slate-800 pt-5 space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Custom Target Overrides</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Daily Calorie Target (kcal)</label>
              <input
                type="number"
                value={formData.calorieTarget}
                onChange={(e) => handleChange('calorieTarget', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Daily Protein Target (g)</label>
              <input
                type="number"
                value={formData.proteinTarget}
                onChange={(e) => handleChange('proteinTarget', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Daily Water Goal (ml)</label>
              <input
                type="number"
                value={formData.waterTarget}
                onChange={(e) => handleChange('waterTarget', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Daily Step Goal</label>
              <input
                type="number"
                value={formData.dailyStepGoal}
                onChange={(e) => handleChange('dailyStepGoal', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating...' : 'Save Profile Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
