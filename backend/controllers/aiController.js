import repo from '../services/repo.js';
import aiService from '../services/aiService.js';

export const chatWithCoach = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { message } = req.body;

    if (!message || String(message).trim() === '') {
      return res.status(400).json({ success: false, message: 'Message text is required.' });
    }

    // Save user message to database/store
    await repo.addChatMessage({
      userId,
      role: 'user',
      message: String(message).trim(),
      timestamp: new Date(),
    });

    // Fetch user profile for context injection
    const profile = (await repo.getProfileByUserId(userId)) || {};
    const chatHistory = await repo.getChatHistory(userId, 10);

    // Call AI service abstraction
    const aiResult = await aiService.chatWithCoach(message, profile, chatHistory);

    // Save assistant reply
    const assistantMsg = await repo.addChatMessage({
      userId,
      role: 'assistant',
      message: aiResult.message,
      isFallback: Boolean(aiResult.isDemoMode),
      timestamp: new Date(),
    });

    res.json({
      success: true,
      message: aiResult.message,
      isDemoMode: aiResult.isDemoMode,
      provider: aiResult.provider,
      chatMessage: assistantMsg,
    });
  } catch (error) {
    next(error);
  }
};

export const getChatHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const history = await repo.getChatHistory(userId, 50);

    res.json({
      success: true,
      history,
    });
  } catch (error) {
    next(error);
  }
};

export const clearChatHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await repo.clearChatHistory(userId);

    res.json({
      success: true,
      message: 'Chat history cleared.',
    });
  } catch (error) {
    next(error);
  }
};

export const generateMealPlan = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = (await repo.getProfileByUserId(userId)) || {};

    const customOverrides = {
      ...profile,
      ...(req.body.calorieTarget && { calorieTarget: Number(req.body.calorieTarget) }),
      ...(req.body.proteinTarget && { proteinTarget: Number(req.body.proteinTarget) }),
      ...(req.body.dietaryPreference && { dietaryPreference: req.body.dietaryPreference }),
      ...(req.body.goal && { goal: req.body.goal }),
    };

    const mealPlan = await aiService.generateMealPlan(customOverrides);

    res.json({
      success: true,
      mealPlan,
    });
  } catch (error) {
    next(error);
  }
};

export const generateWorkoutPlan = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = (await repo.getProfileByUserId(userId)) || {};

    const params = {
      goal: req.body.goal || profile.goal || 'Build Muscle',
      fitnessLevel: req.body.fitnessLevel || 'Intermediate',
      availableEquipment: req.body.availableEquipment || 'Full Gym',
      durationMinutes: req.body.durationMinutes || 45,
    };

    const workoutPlan = await aiService.generateWorkoutPlan(params);

    res.json({
      success: true,
      workoutPlan,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  chatWithCoach,
  getChatHistory,
  clearChatHistory,
  generateMealPlan,
  generateWorkoutPlan,
};
