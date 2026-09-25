import repo from '../services/repo.js';

export const calculateFitnessMetrics = (age, gender, heightCm, weightKg, activityLevel, goal) => {
  const hMeters = heightCm / 100;
  const bmi = Number((weightKg / (hMeters * hMeters)).toFixed(2));

  // Mifflin-St Jeor equation
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'female') {
    bmr -= 161;
  } else if (gender === 'other') {
    bmr -= 78;
  } else {
    bmr += 5; // male
  }
  bmr = Math.round(bmr);

  const actMap = {
    'Sedentary': 1.2,
    'Light': 1.375,
    'Moderate': 1.55,
    'Active': 1.725,
    'Very Active': 1.9,
  };
  const multiplier = actMap[activityLevel] || 1.55;
  const tdee = Math.round(bmr * multiplier);

  let calorieTarget = tdee;
  if (goal === 'Lose Weight') calorieTarget -= 450;
  else if (goal === 'Gain Weight') calorieTarget += 350;
  else if (goal === 'Build Muscle') calorieTarget += 250;

  // Protein targets: 1.6-2.2 g per kg
  let proteinTarget = Math.round(weightKg * (goal === 'Build Muscle' || goal === 'Gain Weight' ? 2.0 : 1.6));

  return { bmi, bmr, tdee, calorieTarget: Math.max(1200, calorieTarget), proteinTarget };
};

export const getProfile = async (req, res, next) => {
  try {
    let profile = await repo.getProfileByUserId(req.user.id);
    if (!profile) {
      // Create initial profile if missing
      profile = await repo.updateOrCreateProfile(req.user.id, {
        age: 24,
        gender: 'male',
        height: 178,
        weight: 74.5,
        activityLevel: 'Moderate',
        goal: 'Build Muscle',
        dietaryPreference: 'Non-Vegetarian',
        targetWeight: 78,
        dailyStepGoal: 10000,
        calorieTarget: 2450,
        proteinTarget: 150,
        waterTarget: 3200,
      });
    }

    const metrics = calculateFitnessMetrics(
      profile.age,
      profile.gender,
      profile.height,
      profile.weight,
      profile.activityLevel,
      profile.goal
    );

    res.json({
      success: true,
      profile: {
        ...profile,
        ...metrics,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const {
      age,
      gender,
      height,
      weight,
      activityLevel,
      goal,
      dietaryPreference,
      targetWeight,
      dailyStepGoal,
      calorieTarget: customCalorieTarget,
      proteinTarget: customProteinTarget,
      waterTarget,
    } = req.body;

    const currentProfile = (await repo.getProfileByUserId(req.user.id)) || {};

    const updatedAge = Number(age ?? currentProfile.age ?? 24);
    const updatedGender = gender ?? currentProfile.gender ?? 'male';
    const updatedHeight = Number(height ?? currentProfile.height ?? 175);
    const updatedWeight = Number(weight ?? currentProfile.weight ?? 72);
    const updatedActivity = activityLevel ?? currentProfile.activityLevel ?? 'Moderate';
    const updatedGoal = goal ?? currentProfile.goal ?? 'Build Muscle';

    const calc = calculateFitnessMetrics(
      updatedAge,
      updatedGender,
      updatedHeight,
      updatedWeight,
      updatedActivity,
      updatedGoal
    );

    const updatePayload = {
      age: updatedAge,
      gender: updatedGender,
      height: updatedHeight,
      weight: updatedWeight,
      activityLevel: updatedActivity,
      goal: updatedGoal,
      dietaryPreference: dietaryPreference ?? currentProfile.dietaryPreference ?? 'Non-Vegetarian',
      targetWeight: Number(targetWeight ?? currentProfile.targetWeight ?? 75),
      dailyStepGoal: Number(dailyStepGoal ?? currentProfile.dailyStepGoal ?? 10000),
      calorieTarget: Number(customCalorieTarget ?? calc.calorieTarget),
      proteinTarget: Number(customProteinTarget ?? calc.proteinTarget),
      waterTarget: Number(waterTarget ?? currentProfile.waterTarget ?? 3000),
      bmi: calc.bmi,
      bmr: calc.bmr,
      tdee: calc.tdee,
    };

    const saved = await repo.updateOrCreateProfile(req.user.id, updatePayload);

    res.json({
      success: true,
      message: 'Profile and fitness metrics updated successfully.',
      profile: saved,
    });
  } catch (error) {
    next(error);
  }
};

export default { getProfile, updateProfile, calculateFitnessMetrics };
