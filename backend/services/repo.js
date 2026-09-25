import { isMongoConnected } from '../config/db.js';
import memoryStore from './memoryStore.js';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import HealthReading from '../models/HealthReading.js';
import FoodEntry from '../models/FoodEntry.js';
import Workout from '../models/Workout.js';
import Progress from '../models/Progress.js';
import ChatMessage from '../models/ChatMessage.js';

export const repo = {
  // USER
  async findUserByEmail(email) {
    if (isMongoConnected) {
      return await User.findOne({ email: email.toLowerCase() });
    }
    return memoryStore.findOne('users', { email: email.toLowerCase() });
  },

  async findUserById(id) {
    if (isMongoConnected) {
      return await User.findById(id).select('-passwordHash');
    }
    const u = memoryStore.findById('users', id);
    if (!u) return null;
    const { passwordHash, ...rest } = u;
    return rest;
  },

  async createUser(userData) {
    if (isMongoConnected) {
      const user = new User(userData);
      return await user.save();
    }
    return memoryStore.insert('users', userData);
  },

  // PROFILE
  async getProfileByUserId(userId) {
    if (isMongoConnected) {
      return await Profile.findOne({ userId });
    }
    return memoryStore.findOne('profiles', { userId });
  },

  async updateOrCreateProfile(userId, profileData) {
    if (isMongoConnected) {
      return await Profile.findOneAndUpdate(
        { userId },
        { ...profileData, userId },
        { new: true, upsert: true, runValidators: true }
      );
    }
    const existing = memoryStore.findOne('profiles', { userId });
    if (existing) {
      return memoryStore.updateById('profiles', existing._id, profileData);
    }
    return memoryStore.insert('profiles', { userId, ...profileData });
  },

  // HEALTH READINGS
  async getRecentReadings(userId, limit = 50) {
    if (isMongoConnected) {
      return await HealthReading.find({ userId }).sort({ timestamp: -1 }).limit(limit);
    }
    const list = memoryStore.find('healthReadings', { userId });
    return list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);
  },

  async saveReading(data) {
    if (isMongoConnected) {
      const r = new HealthReading(data);
      return await r.save();
    }
    return memoryStore.insert('healthReadings', data);
  },

  // NUTRITION / FOOD ENTRIES
  async getFoodEntries(userId, dateStr) {
    if (isMongoConnected) {
      const query = { userId };
      if (dateStr) {
        const start = new Date(dateStr);
        start.setHours(0, 0, 0, 0);
        const end = new Date(dateStr);
        end.setHours(23, 59, 59, 999);
        query.date = { $gte: start, $lte: end };
      }
      return await FoodEntry.find(query).sort({ date: -1 });
    }
    const entries = memoryStore.find('foodEntries', { userId });
    if (!dateStr) return entries.sort((a, b) => new Date(b.date) - new Date(a.date));
    const targetYMD = new Date(dateStr).toISOString().split('T')[0];
    return entries.filter((e) => new Date(e.date).toISOString().split('T')[0] === targetYMD);
  },

  async addFoodEntry(entryData) {
    if (isMongoConnected) {
      const entry = new FoodEntry(entryData);
      return await entry.save();
    }
    return memoryStore.insert('foodEntries', entryData);
  },

  async deleteFoodEntry(userId, id) {
    if (isMongoConnected) {
      return await FoodEntry.findOneAndDelete({ _id: id, userId });
    }
    const item = memoryStore.findById('foodEntries', id);
    if (item && String(item.userId) === String(userId)) {
      return memoryStore.deleteById('foodEntries', id);
    }
    return null;
  },

  // WORKOUTS
  async getWorkouts(userId) {
    if (isMongoConnected) {
      return await Workout.find({ userId }).sort({ date: -1 });
    }
    const list = memoryStore.find('workouts', { userId });
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  async getWorkoutById(userId, id) {
    if (isMongoConnected) {
      return await Workout.findOne({ _id: id, userId });
    }
    const w = memoryStore.findById('workouts', id);
    return w && String(w.userId) === String(userId) ? w : null;
  },

  async createWorkout(workoutData) {
    if (isMongoConnected) {
      const w = new Workout(workoutData);
      return await w.save();
    }
    return memoryStore.insert('workouts', workoutData);
  },

  async updateWorkout(userId, id, updateData) {
    if (isMongoConnected) {
      return await Workout.findOneAndUpdate({ _id: id, userId }, updateData, { new: true });
    }
    const item = memoryStore.findById('workouts', id);
    if (item && String(item.userId) === String(userId)) {
      return memoryStore.updateById('workouts', id, updateData);
    }
    return null;
  },

  async deleteWorkout(userId, id) {
    if (isMongoConnected) {
      return await Workout.findOneAndDelete({ _id: id, userId });
    }
    const item = memoryStore.findById('workouts', id);
    if (item && String(item.userId) === String(userId)) {
      return memoryStore.deleteById('workouts', id);
    }
    return null;
  },

  // PROGRESS
  async getProgress(userId, limit = 30) {
    if (isMongoConnected) {
      return await Progress.find({ userId }).sort({ date: 1 }).limit(limit);
    }
    const list = memoryStore.find('progress', { userId });
    return list.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-limit);
  },

  async addProgress(progressData) {
    if (isMongoConnected) {
      const p = new Progress(progressData);
      return await p.save();
    }
    return memoryStore.insert('progress', progressData);
  },

  // CHAT MESSAGES
  async getChatHistory(userId, limit = 50) {
    if (isMongoConnected) {
      return await ChatMessage.find({ userId }).sort({ timestamp: 1 }).limit(limit);
    }
    const list = memoryStore.find('chatMessages', { userId });
    return list.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)).slice(-limit);
  },

  async addChatMessage(msgData) {
    if (isMongoConnected) {
      const msg = new ChatMessage(msgData);
      return await msg.save();
    }
    return memoryStore.insert('chatMessages', msgData);
  },

  async clearChatHistory(userId) {
    if (isMongoConnected) {
      return await ChatMessage.deleteMany({ userId });
    }
    const coll = memoryStore.getCollection('chatMessages');
    memoryStore.data.chatMessages = coll.filter((m) => String(m.userId) !== String(userId));
    memoryStore.persist();
    return true;
  },

  // SEED RESET
  resetMemoryStore() {
    return memoryStore.resetDemo();
  },
};

export default repo;
