import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import repo from '../services/repo.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fitai_jwt_secret_super_secure_key_2026_fitness_ai';

const generateToken = (id, email) => {
  return jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '30d' });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await repo.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await repo.createUser({
      name,
      email: email.toLowerCase(),
      passwordHash,
    });

    // Create default profile for new user
    const defaultProfile = {
      userId: newUser._id,
      age: 23,
      gender: 'male',
      height: 175,
      weight: 72,
      activityLevel: 'Moderate',
      goal: 'Build Muscle',
      dietaryPreference: 'Non-Vegetarian',
      targetWeight: 75,
      dailyStepGoal: 10000,
      calorieTarget: 2400,
      proteinTarget: 140,
      waterTarget: 3000,
      bmi: 23.51,
      bmr: 1695,
      tdee: 2627,
    };
    await repo.updateOrCreateProfile(newUser._id, defaultProfile);

    const token = generateToken(newUser._id, newUser.email);

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to FitAI.',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const user = await repo.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id, user.email);

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await repo.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const profile = await repo.getProfileByUserId(req.user.id);

    res.json({
      success: true,
      user,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

export const resetDemoData = async (req, res, next) => {
  try {
    repo.resetMemoryStore();
    res.json({
      success: true,
      message: 'Demo dataset successfully reset to initial high-fidelity state.',
    });
  } catch (error) {
    next(error);
  }
};

export default { register, login, getMe, resetDemoData };
