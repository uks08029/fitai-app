import repo from '../services/repo.js';
import sensorSimulator from '../websocket/sensorSimulator.js';

export const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Fetch user profile
    let profile = await repo.getProfileByUserId(userId);
    if (!profile) {
      profile = {
        weight: 74.5,
        targetWeight: 78.0,
        calorieTarget: 2450,
        proteinTarget: 150,
        dailyStepGoal: 10000,
        waterTarget: 3200,
        goal: 'Build Muscle',
        activityLevel: 'Moderate',
      };
    }

    // Today's Date bounds
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Today's food entries
    const foodEntries = await repo.getFoodEntries(userId, todayStr);
    const consumedCalories = foodEntries.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
    const consumedProtein = foodEntries.reduce((sum, item) => sum + (Number(item.protein) || 0), 0);
    const consumedCarbs = foodEntries.reduce((sum, item) => sum + (Number(item.carbs) || 0), 0);
    const consumedFats = foodEntries.reduce((sum, item) => sum + (Number(item.fats) || 0), 0);

    const calorieTarget = profile.calorieTarget || 2400;
    const proteinTarget = profile.proteinTarget || 140;
    const remainingCalories = Math.max(0, calorieTarget - consumedCalories);
    const remainingProtein = Math.max(0, proteinTarget - consumedProtein);

    // Workouts & Streak calculation
    const allWorkouts = await repo.getWorkouts(userId);
    const completedWorkouts = allWorkouts.filter((w) => w.completed);

    // Calculate streak (consecutive days)
    let streak = 0;
    const datesWithWorkouts = new Set(
      completedWorkouts.map((w) => new Date(w.date).toISOString().split('T')[0])
    );

    let checkDate = new Date();
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (datesWithWorkouts.has(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (streak === 0) {
        // check if yesterday had one
        checkDate.setDate(checkDate.getDate() - 1);
        const yDateStr = checkDate.toISOString().split('T')[0];
        if (datesWithWorkouts.has(yDateStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      } else {
        break;
      }
    }
    if (streak === 0 && completedWorkouts.length > 0) streak = 1; // default initial demo streak

    // Today's workout
    const todayWorkout = allWorkouts.find(
      (w) => new Date(w.date).toISOString().split('T')[0] === todayStr
    ) || allWorkouts[0] || null;

    // Progress history for Recharts
    const progressList = await repo.getProgress(userId, 7);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    let weeklyChartData = [];
    if (progressList && progressList.length > 0) {
      weeklyChartData = progressList.slice(-7).map((p) => {
        const d = new Date(p.date);
        return {
          day: dayNames[d.getDay()],
          date: d.toISOString().split('T')[0].slice(5),
          weight: p.weight,
          calories: p.calories || calorieTarget,
          steps: p.steps || 8500,
        };
      });
    } else {
      // Default standard week
      const sampleWeights = [75.2, 75.0, 74.8, 74.7, 74.6, 74.4, 74.5];
      const sampleCalories = [2420, 2390, 2450, 2500, 2410, 2460, consumedCalories || 2020];
      weeklyChartData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => ({
        day: d,
        weight: sampleWeights[i],
        calories: sampleCalories[i],
        steps: 8000 + i * 400,
      }));
    }

    // Live Sensor telemetry snapshot
    const liveTelemetry = sensorSimulator.generateNextReading();

    // Water intake from progress or default
    const latestProgress = progressList[progressList.length - 1];
    const waterConsumedMl = latestProgress?.waterMl || 2600;

    res.json({
      success: true,
      data: {
        summaryCards: {
          currentWeight: {
            value: profile.weight || 74.5,
            unit: 'kg',
            target: profile.targetWeight || 78.0,
            delta: -0.3,
          },
          dailyCalories: {
            consumed: consumedCalories,
            target: calorieTarget,
            remaining: remainingCalories,
            unit: 'kcal',
            percentage: Math.min(100, Math.round((consumedCalories / calorieTarget) * 100)),
          },
          protein: {
            consumed: consumedProtein,
            target: proteinTarget,
            remaining: remainingProtein,
            unit: 'g',
            percentage: Math.min(100, Math.round((consumedProtein / proteinTarget) * 100)),
          },
          workoutStreak: {
            days: streak || 4,
            unit: 'days',
            active: true,
          },
        },
        nutritionBreakdown: {
          calories: { consumed: consumedCalories, target: calorieTarget, remaining: remainingCalories },
          protein: { consumed: consumedProtein, target: proteinTarget },
          carbs: { consumed: consumedCarbs, target: Math.round((calorieTarget * 0.45) / 4) },
          fats: { consumed: consumedFats, target: Math.round((calorieTarget * 0.25) / 9) },
          water: {
            consumedMl: waterConsumedMl,
            targetMl: profile.waterTarget || 3200,
            percentage: Math.min(100, Math.round((waterConsumedMl / (profile.waterTarget || 3200)) * 100)),
          },
        },
        liveHealthSnapshot: {
          heartRate: liveTelemetry.heartRate,
          spo2: liveTelemetry.spo2,
          temperature: liveTelemetry.temperature,
          steps: liveTelemetry.steps,
          stepGoal: profile.dailyStepGoal || 10000,
          stepPercentage: Math.min(100, Math.round((liveTelemetry.steps / (profile.dailyStepGoal || 10000)) * 100)),
          status: liveTelemetry.status,
          alert: liveTelemetry.alert,
          source: liveTelemetry.source,
        },
        todayWorkout: todayWorkout
          ? {
              id: todayWorkout._id,
              name: todayWorkout.name,
              category: todayWorkout.category,
              duration: todayWorkout.duration,
              caloriesBurned: todayWorkout.caloriesBurned,
              completed: todayWorkout.completed,
              exerciseCount: todayWorkout.exercises?.length || 0,
            }
          : null,
        todayMeals: foodEntries,
        weeklyChartData,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default { getDashboardData };
