import repo from '../services/repo.js';

export const getProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = Number(req.query.limit) || 30;

    const progressRecords = await repo.getProgress(userId, limit);
    const profile = (await repo.getProfileByUserId(userId)) || {};

    const formattedRecords = progressRecords.map((p) => {
      const d = new Date(p.date);
      return {
        id: p._id,
        date: d.toISOString().split('T')[0],
        weight: p.weight,
        calories: p.calories || profile.calorieTarget || 2400,
        protein: p.protein || profile.proteinTarget || 140,
        steps: p.steps || 9000,
        waterMl: p.waterMl || 3000,
      };
    });

    res.json({
      success: true,
      currentWeight: profile.weight || 74.5,
      targetWeight: profile.targetWeight || 78.0,
      records: formattedRecords,
    });
  } catch (error) {
    next(error);
  }
};

export const addProgressEntry = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { weight, calories, protein, steps, waterMl, date } = req.body;

    if (!weight) {
      return res.status(400).json({ success: false, message: 'Weight is required.' });
    }

    const newRecord = await repo.addProgress({
      userId,
      weight: Number(weight),
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      steps: Number(steps) || 0,
      waterMl: Number(waterMl) || 2800,
      date: date ? new Date(date) : new Date(),
    });

    // Also update current weight on profile
    await repo.updateOrCreateProfile(userId, { weight: Number(weight) });

    res.status(201).json({
      success: true,
      message: 'Progress recorded.',
      progress: newRecord,
    });
  } catch (error) {
    next(error);
  }
};

export const simulateWhatIf = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const simulatedCalories = Number(req.body.calories || 2200);

    const profile = (await repo.getProfileByUserId(userId)) || {
      weight: 74.5,
      tdee: 2600,
      goal: 'Build Muscle',
    };

    const currentWeight = Number(profile.weight || 74.5);
    const tdee = Number(profile.tdee || 2600);

    // Thermodynamic energy balance
    const dailyDiff = simulatedCalories - tdee; // negative is deficit, positive is surplus
    const weeklyDiff = dailyDiff * 7;
    // ~7700 kcal per kg of body fat/tissue
    const weeklyChangeKg = Number((weeklyDiff / 7700).toFixed(2));

    // Project 8 weeks of weight trajectory
    const projection = [];
    let projectedWeight = currentWeight;

    for (let week = 0; week <= 8; week++) {
      projection.push({
        week: `Week ${week}`,
        weekNumber: week,
        simulatedWeight: Number(projectedWeight.toFixed(1)),
        baselineWeight: currentWeight,
      });
      projectedWeight += weeklyChangeKg;
    }

    let summary = '';
    if (weeklyChangeKg < -0.05) {
      summary = `At ${simulatedCalories} kcal/day (deficit of ${Math.abs(dailyDiff)} kcal), you are projected to lose approximately ${Math.abs(weeklyChangeKg)} kg per week.`;
    } else if (weeklyChangeKg > 0.05) {
      summary = `At ${simulatedCalories} kcal/day (surplus of ${dailyDiff} kcal), you are projected to gain approximately ${weeklyChangeKg} kg per week.`;
    } else {
      summary = `At ${simulatedCalories} kcal/day, intake matches your TDEE (${tdee} kcal). Weight will remain roughly stable.`;
    }

    res.json({
      success: true,
      currentWeight,
      tdee,
      simulatedCalories,
      dailyDifference: dailyDiff,
      weeklyChangeKg,
      projection,
      summary,
      disclaimer: 'Simplified thermodynamic model for software demonstration only. Actual physiological adaptation, water retention, and metabolic changes vary per individual.',
    });
  } catch (error) {
    next(error);
  }
};

export default { getProgress, addProgressEntry, simulateWhatIf };
