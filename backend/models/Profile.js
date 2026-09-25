import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    age: {
      type: Number,
      default: 23,
      min: 10,
      max: 120,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'male',
    },
    height: {
      type: Number,
      required: true,
      default: 175, // cm
    },
    weight: {
      type: Number,
      required: true,
      default: 72, // kg
    },
    activityLevel: {
      type: String,
      enum: ['Sedentary', 'Light', 'Moderate', 'Active', 'Very Active'],
      default: 'Moderate',
    },
    goal: {
      type: String,
      enum: ['Lose Weight', 'Maintain Weight', 'Gain Weight', 'Build Muscle'],
      default: 'Build Muscle',
    },
    dietaryPreference: {
      type: String,
      enum: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Eggetarian'],
      default: 'Non-Vegetarian',
    },
    targetWeight: {
      type: Number,
      default: 75,
    },
    dailyStepGoal: {
      type: Number,
      default: 10000,
    },
    calorieTarget: {
      type: Number,
      default: 2400,
    },
    proteinTarget: {
      type: Number,
      default: 140, // g
    },
    waterTarget: {
      type: Number,
      default: 3000, // ml
    },
    bmi: {
      type: Number,
      default: 23.51,
    },
    bmr: {
      type: Number,
      default: 1695,
    },
    tdee: {
      type: Number,
      default: 2627,
    },
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);
export default Profile;
