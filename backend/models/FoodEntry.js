import mongoose from 'mongoose';

const foodEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    foodName: {
      type: String,
      required: true,
      trim: true,
    },
    mealType: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
      default: 'Breakfast',
    },
    servingSize: {
      type: String,
      default: '1 serving',
    },
    calories: {
      type: Number,
      required: true,
      min: 0,
    },
    protein: {
      type: Number,
      required: true,
      min: 0,
    },
    carbs: {
      type: Number,
      required: true,
      min: 0,
    },
    fats: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const FoodEntry = mongoose.models.FoodEntry || mongoose.model('FoodEntry', foodEntrySchema);
export default FoodEntry;
