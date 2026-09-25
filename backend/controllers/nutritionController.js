import repo from '../services/repo.js';

export const getNutrition = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const dateStr = req.query.date || new Date().toISOString().split('T')[0];

    const entries = await repo.getFoodEntries(userId, dateStr);
    const profile = (await repo.getProfileByUserId(userId)) || {};

    const totals = entries.reduce(
      (acc, item) => {
        acc.calories += Number(item.calories) || 0;
        acc.protein += Number(item.protein) || 0;
        acc.carbs += Number(item.carbs) || 0;
        acc.fats += Number(item.fats) || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    const calorieTarget = profile.calorieTarget || 2400;
    const proteinTarget = profile.proteinTarget || 140;
    const carbsTarget = Math.round((calorieTarget * 0.45) / 4);
    const fatsTarget = Math.round((calorieTarget * 0.25) / 9);

    const progressList = await repo.getProgress(userId, 1);
    const latest = progressList[progressList.length - 1];
    const waterMl = latest?.waterMl || 2400;

    res.json({
      success: true,
      date: dateStr,
      totals,
      targets: {
        calories: calorieTarget,
        protein: proteinTarget,
        carbs: carbsTarget,
        fats: fatsTarget,
        waterMl: profile.waterTarget || 3200,
      },
      waterConsumedMl: waterMl,
      entries,
    });
  } catch (error) {
    next(error);
  }
};

export const addFoodEntry = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { foodName, mealType, servingSize, calories, protein, carbs, fats, date } = req.body;

    if (!foodName || calories === undefined) {
      return res.status(400).json({ success: false, message: 'Food name and calories are required.' });
    }

    const newEntry = await repo.addFoodEntry({
      userId,
      foodName: String(foodName).trim(),
      mealType: mealType || 'Breakfast',
      servingSize: servingSize || '1 serving',
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fats: Number(fats) || 0,
      date: date ? new Date(date) : new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Food entry logged successfully.',
      entry: newEntry,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFoodEntry = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const deleted = await repo.deleteFoodEntry(userId, id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Food entry not found or unauthorized.' });
    }

    res.json({
      success: true,
      message: 'Food entry removed.',
    });
  } catch (error) {
    next(error);
  }
};

export const updateWater = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { amountMl } = req.body;

    const progressList = await repo.getProgress(userId, 1);
    let currentMl = progressList[progressList.length - 1]?.waterMl || 2400;
    const newMl = Math.max(0, currentMl + Number(amountMl || 250));

    // Update or insert today's progress entry
    const today = new Date();
    await repo.addProgress({
      userId,
      weight: 74.5,
      waterMl: newMl,
      date: today,
    });

    res.json({
      success: true,
      waterConsumedMl: newMl,
      message: 'Water logged successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export default { getNutrition, addFoodEntry, deleteFoodEntry, updateWater };
