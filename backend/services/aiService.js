import axios from 'axios';

const AI_API_KEY = process.env.AI_API_KEY || '';
const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini';

export const aiService = {
  /**
   * Main chat completion with AI Coach
   */
  async chatWithCoach(userMessage, userProfile = {}, history = []) {
    if (AI_API_KEY && AI_API_KEY.trim() !== '') {
      try {
        const liveAiResponse = await this.callExternalLLM(userMessage, userProfile, history);
        if (liveAiResponse) {
          return {
            message: liveAiResponse,
            isDemoMode: false,
            provider: AI_PROVIDER,
          };
        }
      } catch (err) {
        console.warn('[AI Service] External API call failed:', err.message);
      }
    }

    // Built-in Intelligent Fallback Engine
    const fallbackResponse = this.generateIntelligentFallbackChat(userMessage, userProfile);
    return {
      message: fallbackResponse,
      isDemoMode: true,
      provider: 'FitAI Built-in Expert Engine (Offline Demo Mode)',
    };
  },

  /**
   * External LLM Call (Supports Google Gemini or OpenAI-compatible)
   */
  async callExternalLLM(userMessage, profile, history) {
    const systemPrompt = `You are FitAI, an elite, encouraging, and science-based personal fitness and sports nutrition coach.
The user profile is:
- Name: ${profile.name || 'User'}
- Age: ${profile.age || 24}
- Gender: ${profile.gender || 'male'}
- Weight: ${profile.weight || 72} kg, Height: ${profile.height || 175} cm
- Goal: ${profile.goal || 'Build Muscle'}
- Calorie Target: ${profile.calorieTarget || 2400} kcal, Protein Target: ${profile.proteinTarget || 140} g
- Dietary Preference: ${profile.dietaryPreference || 'Non-Vegetarian'}
Provide concise, actionable, evidence-based fitness advice. Use formatting with bullet points and bold text where helpful.`;

    if (AI_PROVIDER === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${AI_API_KEY}`;
      const payload = {
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Question: ${userMessage}` }] }
        ]
      };
      const res = await axios.post(url, payload, { timeout: 7000 });
      return res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    } else {
      // OpenAI compatible format
      const url = 'https://api.openai.com/v1/chat/completions';
      const payload = {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...history.slice(-4).map(h => ({ role: h.role === 'assistant' ? 'assistant' : 'user', content: h.message })),
          { role: 'user', content: userMessage }
        ]
      };
      const res = await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${AI_API_KEY}` },
        timeout: 7000,
      });
      return res.data?.choices?.[0]?.message?.content;
    }
  },

  /**
   * Intelligent Rule & Context Fallback Engine for Chat
   */
  generateIntelligentFallbackChat(userMessage, profile) {
    const q = userMessage.toLowerCase();
    const weight = profile.weight || 74.5;
    const goal = profile.goal || 'Build Muscle';
    const diet = profile.dietaryPreference || 'Non-Vegetarian';
    const calTarget = profile.calorieTarget || 2450;
    const proTarget = profile.proteinTarget || 150;

    if (q.includes('protein') || q.includes('how much protein')) {
      const optimalPro = Math.round(weight * 2.0);
      return `Based on your goal of **${goal}** and current weight of **${weight} kg**, your target is **${optimalPro}g of protein per day** (~2.0g per kg of bodyweight).

**Top Protein Sources for your ${diet} preference:**
${
  diet.includes('Vegetarian') || diet.includes('Vegan')
    ? '• **Tofu & Tempeh**: 20g per 100g serving\n• **Lentils & Chickpeas**: 18g per cooked cup\n• **Greek Yogurt / Paneer**: 18–22g per serving\n• **Plant Protein / Whey Isolate**: 24–27g per scoop'
    : '• **Chicken Breast**: 31g protein per 100g cooked\n• **Whole Eggs & Egg Whites**: 6g per egg + 3.6g per white\n• **Salmon / White Fish**: 25g per 100g\n• **Greek Yogurt / Cottage Cheese**: 20g per cup'
}

💡 *Coach Tip:* Distribute this into 4 meals of roughly 35–40g protein each to optimize muscle protein synthesis (MPS) throughout the day!`;
    }

    if (q.includes('workout') || q.includes('exercise') || q.includes('train today')) {
      return `Here is a high-impact **Hypertrophy & Strength Session** tailored for your goal (**${goal}**):

1. **Barbell or Dumbbell Squats**: 4 sets × 8–10 reps *(Rest: 90s)*
2. **Romanian Deadlifts**: 3 sets × 10 reps *(Rest: 90s)*
3. **Incline Dumbbell Chest Press**: 3 sets × 10–12 reps *(Rest: 60s)*
4. **Seated Cable / Chest-Supported Rows**: 4 sets × 12 reps *(Rest: 60s)*
5. **Lateral Deltoid Raises**: 3 sets × 15 reps *(Rest: 45s)*
6. **Hanging Knee or Leg Raises**: 3 sets × 15 reps *(Rest: 45s)*

🔥 **Warm-up:** 5 minutes dynamic leg swings, arm circles, and 2 light ramp-up sets before heavy work. Stay hydrated!`;
    }

    if (q.includes('dinner') || q.includes('what should i eat') || q.includes('lunch') || q.includes('breakfast')) {
      return `For your next meal under your **${calTarget} kcal** daily target, here is a delicious **${diet}** option (~600 kcal, 45g protein):

🍽️ **Balanced Power Plate:**
${
  diet.includes('Vegetarian') || diet.includes('Vegan')
    ? '• **Main:** 180g Spiced Pan-Seared Paneer / Extra Firm Tofu\n• **Carb:** 1 cup cooked Brown Basmati Rice or Quinoa\n• **Veggies:** 1.5 cups steamed broccoli & sautéed bell peppers\n• **Healthy Fats:** 1 tsp olive oil or toasted sesame seeds'
    : '• **Main:** 180g Lemon-Herb Grilled Chicken Breast or Salmon\n• **Carb:** 200g Roasted Sweet Potato cubes\n• **Veggies:** Steamed Asparagus or Broccoli with garlic\n• **Healthy Fats:** Half avocado or drizzle of extra virgin olive oil'
}

📊 **Macro Split:** ~580 kcal | 48g Protein | 54g Carbs | 16g Fats.`;
    }

    if (q.includes('not losing weight') || q.includes('stuck') || q.includes('plateau')) {
      return `Weight loss plateaus are completely normal! Here is what usually causes them and how we fix it:

1. **Water Retention & Cortisol:** Stress, new workouts, or high sodium cause temporary water storage that masks fat loss on the scale.
2. **Hidden Calorie Creep:** Cooking oils, dressings, and sauces can add 200–400 uncounted calories daily. Try weighing foods on a digital kitchen scale for 3–5 days.
3. **Non-Exercise Activity (NEAT):** As we diet, our bodies subconsciously move less. Check your daily step count in the **Live Health** tab to ensure you hit at least 8,000–10,000 steps.
4. **Metabolic Adaptation:** If you have been in a calorie deficit for over 8 weeks, a 2-day "refeed" at maintenance (${calTarget} kcal) can reset leptin levels and revive metabolic rate.`;
    }

    if (q.includes('7-day') || q.includes('plan') || q.includes('meal plan')) {
      return `I can generate full structured meal plans anytime! You can also click the **"AI Meal Planner"** in the sidebar to generate, customize, and regenerate meals instantly.

**Core Nutrition Rules for ${profile.name || 'you'}:**
• Daily Target: **${calTarget} Calories**
• Daily Protein: **${proTarget}g**
• Hydration: Aim for 3–3.5 Liters of water daily
• Dietary Framework: **${diet}**`;
    }

    // Default friendly coach response
    return `Great question! As your AI Fitness Coach, I'm analyzing your current metrics (${weight} kg, ${goal}, ${diet}).

To keep making progress toward your **${goal}**:
• Ensure your daily intake remains close to **${calTarget} kcal**
• Keep protein locked in at **${proTarget}g** to protect and build muscle tissue
• Prioritize 7–8 hours of quality sleep for hormonal recovery and muscle repair

What specific area would you like to dive into today — your training routine, meal timing, or supplement protocol?`;
  },

  /**
   * Generates a 4-meal daily meal plan with exact macros and ingredients
   */
  async generateMealPlan(profile = {}) {
    const calTarget = profile.calorieTarget || 2400;
    const proTarget = profile.proteinTarget || 140;
    const diet = profile.dietaryPreference || 'Non-Vegetarian';
    const goal = profile.goal || 'Build Muscle';

    // Distribute calories: Breakfast 25%, Lunch 35%, Snack 15%, Dinner 25%
    const bKcal = Math.round(calTarget * 0.25);
    const lKcal = Math.round(calTarget * 0.35);
    const sKcal = Math.round(calTarget * 0.15);
    const dKcal = calTarget - (bKcal + lKcal + sKcal);

    const bPro = Math.round(proTarget * 0.25);
    const lPro = Math.round(proTarget * 0.35);
    const sPro = Math.round(proTarget * 0.15);
    const dPro = proTarget - (bPro + lPro + sPro);

    const isVeg = diet.includes('Vegetarian') || diet.includes('Vegan');
    const isVegan = diet.includes('Vegan');

    const meals = [
      {
        mealType: 'Breakfast',
        name: isVegan
          ? 'Protein Chia Oatmeal with Almond Butter & Berries'
          : isVeg
          ? 'High-Protein Greek Yogurt Bowl with Rolled Oats & Walnuts'
          : 'Scrambled Eggs with Avocado & Whole Grain Sourdough',
        calories: bKcal,
        protein: bPro,
        carbs: Math.round((bKcal * 0.45) / 4),
        fats: Math.round((bKcal * 0.3) / 9),
        ingredients: isVegan
          ? ['80g Rolled Oats', '1 scoop Plant Protein', '1 tbsp Chia Seeds', '100g Fresh Berries', '15g Almond Butter']
          : isVeg
          ? ['200g Greek Yogurt (0% Fat)', '60g Rolled Oats', '1 tbsp Honey', '20g Crushed Walnuts', 'Blueberries']
          : ['3 Large Free-Range Eggs', '2 Slices Sourdough Toast', '1/2 Ripe Avocado', '1 cup Baby Spinach', 'Olive Oil spray'],
        preparationTip: 'Prepare oats the night before as overnight oats for maximum nutrient absorption.',
      },
      {
        mealType: 'Lunch',
        name: isVegan
          ? 'Tempeh & Quinoa Power Bowl with Tahini Drizzle'
          : isVeg
          ? 'Paneer Tikka with Brown Basmati Rice & Dal Makhani'
          : 'Grilled Herb Chicken Breast with Brown Rice & Steamed Broccoli',
        calories: lKcal,
        protein: lPro,
        carbs: Math.round((lKcal * 0.45) / 4),
        fats: Math.round((lKcal * 0.25) / 9),
        ingredients: isVegan
          ? ['180g Marinated Tempeh', '1 cup Cooked Quinoa', '1 cup Steamed Broccoli', '1 tbsp Lemon Tahini Dressing', 'Cherry Tomatoes']
          : isVeg
          ? ['160g Low-fat Paneer Cubes', '1 cup Cooked Brown Rice', '3/4 cup Yellow Lentil Dal', 'Cucumber & Tomato Salad']
          : ['200g Grilled Chicken Breast', '1.5 cups Brown Rice', '1.5 cups Steamed Broccoli', '1 tbsp Extra Virgin Olive Oil'],
        preparationTip: 'Batch cook carbs and proteins on Sunday to assemble in under 5 minutes.',
      },
      {
        mealType: 'Snack',
        name: isVegan
          ? 'Roasted Edamame & Mixed Raw Nuts with Green Tea'
          : 'Whey Protein Isolate Shake with Banana & Peanut Butter',
        calories: sKcal,
        protein: sPro,
        carbs: Math.round((sKcal * 0.4) / 4),
        fats: Math.round((sKcal * 0.3) / 9),
        ingredients: isVegan
          ? ['60g Dry Roasted Edamame', '20g Raw Almonds', 'Organic Japanese Green Tea']
          : ['1 scoop Whey Protein Isolate (30g)', '1 Medium Banana', '1 tbsp Natural Peanut Butter', '250ml Unsweetened Almond Milk'],
        preparationTip: 'Consume 60–90 minutes before your workout for optimal glycogen and amino acid delivery.',
      },
      {
        mealType: 'Dinner',
        name: isVegan
          ? 'Spiced Chickpea & Sweet Potato Curry with Steamed Spinach'
          : isVeg
          ? 'Tofu Stir-Fry with Soba Noodles & Roasted Sesame Vegetables'
          : 'Baked Atlantic Salmon with Sweet Potato & Roasted Asparagus',
        calories: dKcal,
        protein: dPro,
        carbs: Math.round((dKcal * 0.4) / 4),
        fats: Math.round((dKcal * 0.3) / 9),
        ingredients: isVegan
          ? ['1.5 cups Cooked Chickpeas', '200g Roasted Sweet Potato cubes', 'Coconut milk curry base', 'Baby Spinach']
          : isVeg
          ? ['200g Extra-Firm Tofu cubes', '80g Soba Noodles', 'Bok Choy & Bell Peppers', 'Low-Sodium Tamari & Garlic']
          : ['180g Wild Atlantic Salmon Fillet', '200g Baked Sweet Potato', '120g Roasted Asparagus spears', 'Lemon wedge & dill'],
        preparationTip: 'Rich in Omega-3 fatty acids and slow-digesting carbs to promote deep sleep and muscular recovery.',
      },
    ];

    const totalKcal = meals.reduce((acc, m) => acc + m.calories, 0);
    const totalPro = meals.reduce((acc, m) => acc + m.protein, 0);
    const totalCarbs = meals.reduce((acc, m) => acc + m.carbs, 0);
    const totalFats = meals.reduce((acc, m) => acc + m.fats, 0);

    return {
      goal,
      dietaryPreference: diet,
      totalCalories: totalKcal,
      totalProtein: totalPro,
      totalCarbs,
      totalFats,
      meals,
      generatedAt: new Date().toISOString(),
      isDemoMode: !AI_API_KEY,
    };
  },

  /**
   * Generates a complete workout routine with warmup, exercises, and cooldown
   */
  async generateWorkoutPlan(params = {}) {
    const goal = params.goal || 'Build Muscle';
    const level = params.fitnessLevel || 'Intermediate';
    const equipment = params.availableEquipment || 'Full Gym';
    const duration = Number(params.durationMinutes || 45);

    const warmups = [
      { name: 'Dynamic Arm Circles & Chest Openers', duration: '2 mins' },
      { name: 'World’s Greatest Stretch & Hip Openers', duration: '3 mins' },
      { name: 'Light Cardio (Rowing or Jump Rope)', duration: '3 mins' },
    ];

    let exercises = [];

    if (equipment === 'Bodyweight / Home') {
      exercises = [
        { name: 'Explosive Push-ups', sets: 4, reps: 15, restSec: 60, targetMuscle: 'Chest & Triceps' },
        { name: 'Bulgarian Split Squats', sets: 4, reps: 12, restSec: 60, targetMuscle: 'Quads & Glutes' },
        { name: 'Inverted Body Rows (or Doorframe Rows)', sets: 3, reps: 12, restSec: 60, targetMuscle: 'Upper Back' },
        { name: 'Pike Push-ups (Shoulder Focus)', sets: 3, reps: 10, restSec: 60, targetMuscle: 'Shoulders' },
        { name: 'Plank Shoulder Taps', sets: 3, reps: 20, restSec: 45, targetMuscle: 'Core & Stabilizers' },
      ];
    } else if (equipment === 'Dumbbells Only') {
      exercises = [
        { name: 'Goblet Squats', sets: 4, reps: 12, weightKg: 20, restSec: 75, targetMuscle: 'Quads' },
        { name: 'Dumbbell Floor or Bench Press', sets: 4, reps: 10, weightKg: 22, restSec: 75, targetMuscle: 'Chest' },
        { name: 'Single-Arm Dumbbell Rows', sets: 3, reps: 12, weightKg: 24, restSec: 60, targetMuscle: 'Lats & Back' },
        { name: 'Romanian Dumbbell Deadlifts', sets: 3, reps: 10, weightKg: 22, restSec: 75, targetMuscle: 'Hamstrings' },
        { name: 'Standing Dumbbell Overhead Press', sets: 3, reps: 10, weightKg: 14, restSec: 60, targetMuscle: 'Shoulders' },
      ];
    } else {
      // Full Gym
      exercises = [
        { name: 'Barbell Squats', sets: 4, reps: 8, weightKg: 85, restSec: 90, targetMuscle: 'Quads & Glutes' },
        { name: 'Flat Barbell Bench Press', sets: 4, reps: 8, weightKg: 75, restSec: 90, targetMuscle: 'Chest' },
        { name: 'Bent-Over Barbell Rows', sets: 4, reps: 10, weightKg: 65, restSec: 75, targetMuscle: 'Back' },
        { name: 'Overhead Barbell Military Press', sets: 3, reps: 10, weightKg: 45, restSec: 60, targetMuscle: 'Shoulders' },
        { name: 'Incline Dumbbell Bicep Curls', sets: 3, reps: 12, weightKg: 14, restSec: 45, targetMuscle: 'Biceps' },
        { name: 'Cable Tricep Pushdowns', sets: 3, reps: 15, weightKg: 25, restSec: 45, targetMuscle: 'Triceps' },
      ];
    }

    const cooldown = [
      { name: 'Hamstring & Glute Static Stretch', duration: '2 mins' },
      { name: 'Doorway Pec Stretch & Child’s Pose', duration: '2 mins' },
      { name: 'Deep Diaphragmatic Box Breathing', duration: '1 min' },
    ];

    const estimatedBurn = Math.round(duration * 7.5);

    return {
      title: `${level} ${goal} Protocol`,
      goal,
      fitnessLevel: level,
      equipment,
      durationMinutes: duration,
      caloriesBurned: estimatedBurn,
      warmup: warmups,
      exercises: exercises.map((e, idx) => ({ ...e, id: `ex_${idx + 1}`, completed: false })),
      cooldown,
      generatedAt: new Date().toISOString(),
      disclaimer: 'Software demonstration workout plan — adjust weights and intensities safely according to your body.',
    };
  },
};

export default aiService;
