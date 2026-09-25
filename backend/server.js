import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import { connectDB } from './config/db.js';
import { initWebSocket } from './websocket/socketServer.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import nutritionRoutes from './routes/nutritionRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import mlRoutes from './routes/mlRoutes.js';

const app = express();
const server = http.createServer(app);

// Initialize Database connection (with automatic fallback to high-fidelity memory/JSON store)
connectDB();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Root & Health
app.get('/', (req, res) => {
  res.json({
    app: 'FitAI - AI Fitness & Diet Assistant API',
    status: 'online',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: [
      '/api/auth',
      '/api/profile',
      '/api/dashboard',
      '/api/nutrition',
      '/api/workouts',
      '/api/progress',
      '/api/health',
      '/api/sensors/reading',
      '/api/ai',
      '/api/ml'
    ],
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/sensors', healthRoutes); // for /api/sensors/reading
app.use('/api/ai', aiRoutes);
app.use('/api/ml', mlRoutes);

// Error Middleware
app.use(notFound);
app.use(errorHandler);

// Attach WebSocket Server to HTTP server
initWebSocket(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`  FitAI Backend Server running on port ${PORT}`);
  console.log(`  REST API:   http://localhost:${PORT}`);
  console.log(`  WebSocket:  ws://localhost:${PORT}`);
  console.log(`  ML Proxy:   ${process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000'}`);
  console.log(`==================================================`);
});
