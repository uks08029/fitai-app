import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import HealthReading from '../models/HealthReading.js';
import FoodEntry from '../models/FoodEntry.js';
import Workout from '../models/Workout.js';
import Progress from '../models/Progress.js';
import ChatMessage from '../models/ChatMessage.js';
import memoryStore from '../services/memoryStore.js';

dotenv.config();

const seedDatabase = async () => {
  console.log('[FitAI Seed] Starting database seeding process...');

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fitai';
  let isMongo = false;

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    isMongo = true;
    console.log('[FitAI Seed] Connected to MongoDB. Seeding collections directly in MongoDB...');
  } catch (e) {
    console.log('[FitAI Seed] MongoDB not detected. Seeding high-fidelity in-memory/JSON store...');
    memoryStore.resetDemo();
    console.log('[FitAI Seed] In-Memory / JSON store refreshed with full demo data!');
    process.exit(0);
  }

  try {
    // Clear collections
    await User.deleteMany({});
    await Profile.deleteMany({});
    await HealthReading.deleteMany({});
    await FoodEntry.deleteMany({});
    await Workout.deleteMany({});
    await Progress.deleteMany({});
    await ChatMessage.deleteMany({});

    const passwordHash = await bcrypt.hash('password123', 10);
    const demoUser = await User.create({
      name: 'Alex Rivera',
      email: 'alex@fitai.demo',
      passwordHash,
    });

    console.log(`[FitAI Seed] Created demo user: ${demoUser.email} (Password: password123)`);

    const demoProfile = await Profile.create({
      userId: demoUser._id,
      age: 24,
      gender: 'male',
      height: 178,
      weight: 74.5,
      activityLevel: 'Moderate',
      goal: 'Build Muscle',
      dietaryPreference: 'Non-Vegetarian',
      targetWeight: 78.0,
      dailyStepGoal: 10000,
      calorieTarget: 2450,
      proteinTarget: 150,
      waterTarget: 3200,
      bmi: 23.51,
      bmr: 1720,
      tdee: 2666,
    });

    console.log(`[FitAI Seed] Created user profile with biometrics.`);

    // 14 days of progress records
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);

      await Progress.create({
        userId: demoUser._id,
        weight: Number((75.8 - (13 - i) * 0.1).toFixed(1)),
        calories: 2350 + Math.floor(Math.random() * 150),
        protein: 145 + Math.floor(Math.random() * 15),
        steps: 8500 + Math.floor(Math.random() * 2500),
        waterMl: 2800 + Math.floor(Math.random() * 500),
        date: d,
      });
    }

    // Workouts
    await Workout.create([
      {
        userId: demoUser._id,
        name: 'Upper Body Hypertrophy & Core',
        category: 'Strength',
        duration: 55,
        caloriesBurned: 410,
        completed: true,
        exercises: [
          { name: 'Barbell Bench Press', sets: 4, reps: 10, weightKg: 75, completed: true, restSec: 90, targetMuscle: 'Chest' },
          { name: 'Incline Dumbbell Press', sets: 3, reps: 12, weightKg: 24, completed: true, restSec: 60, targetMuscle: 'Upper Chest' },
          { name: 'Bent-Over Barbell Rows', sets: 4, reps: 10, weightKg: 65, completed: true, restSec: 90, targetMuscle: 'Back' },
          { name: 'Overhead Dumbbell Press', sets: 3, reps: 12, weightKg: 18, completed: true, restSec: 60, targetMuscle: 'Shoulders' },
          { name: 'Tricep Cable Pushdowns', sets: 3, reps: 15, weightKg: 25, completed: true, restSec: 45, targetMuscle: 'Triceps' },
        ],
        date: now,
      },
      {
        userId: demoUser._id,
        name: 'Lower Body & Posterior Chain',
        category: 'Strength',
        duration: 50,
        caloriesBurned: 440,
        completed: true,
        exercises: [
          { name: 'Barbell Back Squats', sets: 4, reps: 8, weightKg: 95, completed: true, restSec: 120, targetMuscle: 'Quads/Glutes' },
          { name: 'Romanian Deadlifts', sets: 3, reps: 10, weightKg: 85, completed: true, restSec: 90, targetMuscle: 'Hamstrings' },
        ],
        date: new Date(Date.now() - 86400000),
      },
    ]);

    // Food entries
    await FoodEntry.create([
      {
        userId: demoUser._id,
        foodName: 'Oatmeal with Blueberries & Whey',
        mealType: 'Breakfast',
        servingSize: '1 large bowl (350g)',
        calories: 460,
        protein: 34,
        carbs: 62,
        fats: 8,
        date: now,
      },
      {
        userId: demoUser._id,
        foodName: 'Grilled Chicken Breast with Brown Rice & Broccoli',
        mealType: 'Lunch',
        servingSize: '1 plate (400g)',
        calories: 680,
        protein: 58,
        carbs: 72,
        fats: 14,
        date: now,
      },
      {
        userId: demoUser._id,
        foodName: 'Greek Yogurt & Almonds',
        mealType: 'Snack',
        servingSize: '200g yogurt, 20g almonds',
        calories: 290,
        protein: 22,
        carbs: 16,
        fats: 14,
        date: now,
      },
      {
        userId: demoUser._id,
        foodName: 'Salmon Fillet with Sweet Potato Mash',
        mealType: 'Dinner',
        servingSize: '350g',
        calories: 590,
        protein: 42,
        carbs: 48,
        fats: 22,
        date: now,
      },
    ]);

    // Initial Chat Message
    await ChatMessage.create({
      userId: demoUser._id,
      role: 'assistant',
      message: "Hello Alex! I'm your FitAI Fitness & Nutrition Coach. I have your current metrics: 74.5 kg, building lean muscle at 2,450 kcal/day with 150g protein target. How can I optimize your training or diet today?",
      timestamp: now,
    });

    console.log('[FitAI Seed] MongoDB successfully populated with rich demo data!');
    process.exit(0);
  } catch (err) {
    console.error('[FitAI Seed] Error during MongoDB seeding:', err);
    process.exit(1);
  }
};

seedDatabase();
