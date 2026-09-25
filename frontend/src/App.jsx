import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import LiveHealth from './pages/LiveHealth';
import Nutrition from './pages/Nutrition';
import Workout from './pages/Workout';
import Progress from './pages/Progress';
import AICoach from './pages/AICoach';
import MealPlanner from './pages/MealPlanner';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import { Spinner } from './components/LoadingSkeleton';

// Protected Route wrapper that redirects unauthenticated users to /login
const ProtectedRoute = ({ children, pageTitle, sidebarOpen, setSidebarOpen }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070a12] flex items-center justify-center">
        <Spinner text="Initializing FitAI..." size="w-8 h-8" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#080c16] text-slate-100 flex flex-col">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content container with offset for desktop sidebar */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} pageTitle={pageTitle} />
        <main className="flex-1 pb-16">{children}</main>
      </div>
    </div>
  );
};

export const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070a12] flex items-center justify-center">
        <Spinner text="Loading FitAI..." size="w-8 h-8" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
      />

      {/* Protected Dashboard & App Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute
            pageTitle="Dashboard Overview"
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          >
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/live-health"
        element={
          <ProtectedRoute
            pageTitle="Live Health Telemetry"
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          >
            <LiveHealth />
          </ProtectedRoute>
        }
      />

      <Route
        path="/nutrition"
        element={
          <ProtectedRoute
            pageTitle="Nutrition & Macros"
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          >
            <Nutrition />
          </ProtectedRoute>
        }
      />

      <Route
        path="/workout"
        element={
          <ProtectedRoute
            pageTitle="Workouts & Training"
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          >
            <Workout />
          </ProtectedRoute>
        }
      />

      <Route
        path="/progress"
        element={
          <ProtectedRoute
            pageTitle="Biometric Progress"
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          >
            <Progress />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ai-coach"
        element={
          <ProtectedRoute
            pageTitle="AI Fitness Coach"
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          >
            <AICoach />
          </ProtectedRoute>
        }
      />

      <Route
        path="/meal-planner"
        element={
          <ProtectedRoute
            pageTitle="AI Meal Planner"
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          >
            <MealPlanner />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute
            pageTitle="Biometric Profile"
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          >
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute
            pageTitle="System Settings"
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          >
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Fallback routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;
