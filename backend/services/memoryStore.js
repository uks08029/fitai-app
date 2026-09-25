import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '..', '.memory_db.json');

// Default initial state with rich demo data
const getInitialSeedState = () => {
  const demoUserId = '64f1a2b3c4d5e6f7a8b9c0d1';
  const hashedPw = bcrypt.hashSync('password123', 10);

  const now = new Date();
  const getPastDate = (daysAgo) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString();
  };

  return {
    users: [
      {
        _id: demoUserId,
        name: 'Alex Rivera',
        email: 'alex@fitai.demo',
        passwordHash: hashedPw,
        createdAt: getPastDate(30),
        updatedAt: getPastDate(1),
      },
    ],
    profiles: [
      {
        _id: '64f1a2b3c4d5e6f7a8b9c0d2',
        userId: demoUserId,
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
        createdAt: getPastDate(30),
        updatedAt: getPastDate(1),
      },
    ],
    healthReadings: [
      {
        _id: 'hr_1',
        userId: demoUserId,
        heartRate: 72,
        spo2: 98,
        temperature: 36.6,
        steps: 7420,
        source: 'Demo Sensor Simulator',
        timestamp: getPastDate(0),
      },
      {
        _id: 'hr_2',
        userId: demoUserId,
        heartRate: 76,
        spo2: 99,
        temperature: 36.7,
        steps: 9230,
        source: 'Demo Sensor Simulator',
        timestamp: getPastDate(1),
      },
    ],
    foodEntries: [
      {
        _id: 'fe_1',
        userId: demoUserId,
        foodName: 'Oatmeal with Blueberries & Whey',
        mealType: 'Breakfast',
        servingSize: '1 large bowl (350g)',
        calories: 460,
        protein: 34,
        carbs: 62,
        fats: 8,
        date: getPastDate(0),
      },
      {
        _id: 'fe_2',
        userId: demoUserId,
        foodName: 'Grilled Chicken Breast with Brown Rice & Broccoli',
        mealType: 'Lunch',
        servingSize: '1 plate (400g)',
        calories: 680,
        protein: 58,
        carbs: 72,
        fats: 14,
        date: getPastDate(0),
      },
      {
        _id: 'fe_3',
        userId: demoUserId,
        foodName: 'Greek Yogurt & Almonds',
        mealType: 'Snack',
        servingSize: '200g yogurt, 20g almonds',
        calories: 290,
        protein: 22,
        carbs: 16,
        fats: 14,
        date: getPastDate(0),
      },
      {
        _id: 'fe_4',
        userId: demoUserId,
        foodName: 'Salmon Fillet with Sweet Potato Mash',
        mealType: 'Dinner',
        servingSize: '350g',
        calories: 590,
        protein: 42,
        carbs: 48,
        fats: 22,
        date: getPastDate(0),
      },
      // Previous days
      {
        _id: 'fe_5',
        userId: demoUserId,
        foodName: 'Egg White Omelet & Whole Wheat Toast',
        mealType: 'Breakfast',
        servingSize: '1 serving',
        calories: 420,
        protein: 36,
        carbs: 40,
        fats: 11,
        date: getPastDate(1),
      },
      {
        _id: 'fe_6',
        userId: demoUserId,
        foodName: 'Paneer / Tofu Stir Fry with Quinoa',
        mealType: 'Lunch',
        servingSize: '1 bowl',
        calories: 620,
        protein: 38,
        carbs: 65,
        fats: 20,
        date: getPastDate(1),
      },
    ],
    workouts: [
      {
        _id: 'w_1',
        userId: demoUserId,
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
          { name: 'Hanging Leg Raises', sets: 3, reps: 15, weightKg: 0, completed: true, restSec: 45, targetMuscle: 'Abs' },
        ],
        date: getPastDate(0),
      },
      {
        _id: 'w_2',
        userId: demoUserId,
        name: 'Lower Body & Explosive Power',
        category: 'Strength',
        duration: 50,
        caloriesBurned: 440,
        completed: true,
        exercises: [
          { name: 'Barbell Back Squats', sets: 4, reps: 8, weightKg: 95, completed: true, restSec: 120, targetMuscle: 'Quads/Glutes' },
          { name: 'Romanian Deadlifts', sets: 3, reps: 10, weightKg: 85, completed: true, restSec: 90, targetMuscle: 'Hamstrings' },
          { name: 'Walking Lunges', sets: 3, reps: 12, weightKg: 16, completed: true, restSec: 60, targetMuscle: 'Legs' },
          { name: 'Standing Calf Raises', sets: 4, reps: 15, weightKg: 50, completed: true, restSec: 45, targetMuscle: 'Calves' },
        ],
        date: getPastDate(1),
      },
      {
        _id: 'w_3',
        userId: demoUserId,
        name: 'HIIT Cardio & Mobility Intervals',
        category: 'HIIT',
        duration: 35,
        caloriesBurned: 350,
        completed: true,
        exercises: [
          { name: 'Rowing Machine Sprints', sets: 5, reps: 1, weightKg: 0, completed: true, restSec: 60, targetMuscle: 'Cardio' },
          { name: 'Kettlebell Swings', sets: 4, reps: 20, weightKg: 20, completed: true, restSec: 45, targetMuscle: 'Posterior Chain' },
          { name: 'Box Jumps', sets: 3, reps: 12, weightKg: 0, completed: true, restSec: 45, targetMuscle: 'Explosiveness' },
        ],
        date: getPastDate(3),
      },
    ],
    progress: [
      { _id: 'p_14', userId: demoUserId, weight: 75.8, calories: 2420, protein: 145, steps: 9540, waterMl: 3100, date: getPastDate(13) },
      { _id: 'p_13', userId: demoUserId, weight: 75.6, calories: 2380, protein: 142, steps: 10200, waterMl: 3200, date: getPastDate(12) },
      { _id: 'p_12', userId: demoUserId, weight: 75.4, calories: 2450, protein: 150, steps: 8900, waterMl: 2900, date: getPastDate(11) },
      { _id: 'p_11', userId: demoUserId, weight: 75.2, calories: 2500, protein: 155, steps: 11100, waterMl: 3400, date: getPastDate(10) },
      { _id: 'p_10', userId: demoUserId, weight: 75.0, calories: 2410, protein: 148, steps: 9800, waterMl: 3000, date: getPastDate(9) },
      { _id: 'p_9',  userId: demoUserId, weight: 74.9, calories: 2390, protein: 146, steps: 8700, waterMl: 2800, date: getPastDate(8) },
      { _id: 'p_8',  userId: demoUserId, weight: 74.8, calories: 2460, protein: 152, steps: 10450, waterMl: 3300, date: getPastDate(7) },
      { _id: 'p_7',  userId: demoUserId, weight: 74.7, calories: 2420, protein: 150, steps: 9900, waterMl: 3100, date: getPastDate(6) },
      { _id: 'p_6',  userId: demoUserId, weight: 74.6, calories: 2480, protein: 154, steps: 10800, waterMl: 3250, date: getPastDate(5) },
      { _id: 'p_5',  userId: demoUserId, weight: 74.5, calories: 2440, protein: 149, steps: 9600, waterMl: 3000, date: getPastDate(4) },
      { _id: 'p_4',  userId: demoUserId, weight: 74.4, calories: 2390, protein: 147, steps: 10100, waterMl: 3200, date: getPastDate(3) },
      { _id: 'p_3',  userId: demoUserId, weight: 74.5, calories: 2470, protein: 153, steps: 11300, waterMl: 3400, date: getPastDate(2) },
      { _id: 'p_2',  userId: demoUserId, weight: 74.4, calories: 2430, protein: 150, steps: 9750, waterMl: 3100, date: getPastDate(1) },
      { _id: 'p_1',  userId: demoUserId, weight: 74.5, calories: 2020, protein: 156, steps: 7420, waterMl: 2600, date: getPastDate(0) },
    ],
    chatMessages: [
      {
        _id: 'msg_1',
        userId: demoUserId,
        role: 'assistant',
        message: "Hello Alex! I am your FitAI Fitness & Nutrition Coach. I have your current metrics: 74.5 kg, building lean muscle at 2,450 kcal/day with 150g protein target. How can I optimize your training or diet today?",
        isFallback: false,
        timestamp: getPastDate(1),
      },
    ],
  };
};

class MemoryStore {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.data = getInitialSeedState();
        this.persist();
      }
    } catch (e) {
      console.warn('[MemoryStore] Notice reading db file, restoring fresh seed data:', e.message);
      this.data = getInitialSeedState();
      this.persist();
    }
  }

  persist() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('[MemoryStore] Error persisting to disk:', e.message);
    }
  }

  generateId() {
    return 'id_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  }

  // Generic collection accessors
  getCollection(name) {
    if (!this.data[name]) {
      this.data[name] = [];
    }
    return this.data[name];
  }

  find(collectionName, query = {}) {
    const coll = this.getCollection(collectionName);
    return coll.filter((item) => {
      for (const [k, v] of Object.entries(query)) {
        if (item[k] !== v && String(item[k]) !== String(v)) return false;
      }
      return true;
    });
  }

  findOne(collectionName, query = {}) {
    const results = this.find(collectionName, query);
    return results.length > 0 ? results[0] : null;
  }

  findById(collectionName, id) {
    return this.findOne(collectionName, { _id: id });
  }

  insert(collectionName, doc) {
    const coll = this.getCollection(collectionName);
    const newDoc = {
      _id: doc._id || this.generateId(),
      ...doc,
      createdAt: doc.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    coll.push(newDoc);
    this.persist();
    return newDoc;
  }

  updateById(collectionName, id, updateData) {
    const coll = this.getCollection(collectionName);
    const idx = coll.findIndex((item) => String(item._id) === String(id));
    if (idx !== -1) {
      coll[idx] = {
        ...coll[idx],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
      this.persist();
      return coll[idx];
    }
    return null;
  }

  updateOne(collectionName, query, updateData) {
    const item = this.findOne(collectionName, query);
    if (item) {
      return this.updateById(collectionName, item._id, updateData);
    }
    return null;
  }

  deleteById(collectionName, id) {
    const coll = this.getCollection(collectionName);
    const idx = coll.findIndex((item) => String(item._id) === String(id));
    if (idx !== -1) {
      const removed = coll.splice(idx, 1)[0];
      this.persist();
      return removed;
    }
    return null;
  }

  resetDemo() {
    this.data = getInitialSeedState();
    this.persist();
    return true;
  }
}

export const memoryStore = new MemoryStore();
export default memoryStore;
