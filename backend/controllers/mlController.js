import mlClient from '../services/mlClient.js';
import repo from '../services/repo.js';

export const predictCalories = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    let userProfile = {};
    if (userId) {
      userProfile = (await repo.getProfileByUserId(userId)) || {};
    }

    const inputData = {
      age: Number(req.body.age ?? userProfile.age ?? 24),
      gender: req.body.gender ?? userProfile.gender ?? 'male',
      height: Number(req.body.height ?? userProfile.height ?? 175),
      weight: Number(req.body.weight ?? userProfile.weight ?? 72),
      activity_level: req.body.activity_level ?? userProfile.activityLevel ?? 'moderate',
      goal: req.body.goal ?? userProfile.goal ?? 'lose',
      exercise_frequency: Number(req.body.exercise_frequency ?? 4),
    };

    const prediction = await mlClient.predictCalories(inputData);

    res.json({
      success: true,
      prediction,
    });
  } catch (error) {
    next(error);
  }
};

export const getModelInfo = async (req, res, next) => {
  try {
    const info = await mlClient.getModelInfo();
    res.json({
      success: true,
      modelInfo: info,
    });
  } catch (error) {
    next(error);
  }
};

export default { predictCalories, getModelInfo };
