import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Utensils,
  Dumbbell,
  TrendingUp,
  Bot,
  ChefHat,
  User,
  Settings,
  LogOut,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, profile } = useAuth();
  const { isConnected } = useWebSocket();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    {
      name: 'Live Health',
      path: '/live-health',
      icon: Activity,
      badge: isConnected ? 'LIVE' : 'OFFLINE',
      badgeColor: isConnected ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    },
    { name: 'Nutrition', path: '/nutrition', icon: Utensils },
    { name: 'Workout', path: '/workout', icon: Dumbbell },
    { name: 'Progress', path: '/progress', icon: TrendingUp },
    { name: 'AI Coach', path: '/ai-coach', icon: Bot, highlight: true },
    { name: 'Meal Planner', path: '/meal-planner', icon: ChefHat },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-[#0c1222]/90 backdrop-blur-xl border-r border-slate-800/80 shadow-2xl`}
      >
        {/* Brand Header */}
        <div>
          <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800/60">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/25">
              <Zap className="w-6 h-6 text-slate-950 fill-current animate-pulse-slow" />
              <div className="absolute -inset-0.5 rounded-xl bg-cyan-400/30 blur-sm -z-10" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-wider text-white">Fit</span>
                <span className="text-2xl font-black tracking-wider gradient-text-cyan">AI</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-tight">AI Fitness Companion</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 py-5 space-y-1.5 overflow-y-auto max-h-[calc(100vh-230px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/5'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/40 hover:border hover:border-slate-700/50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                            isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full border ${item.badgeColor} flex items-center gap-1`}
                        >
                          {isConnected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
                          {item.badge}
                        </span>
                      )}
                      {item.highlight && !item.badge && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          AI
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer User Info */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-900/30">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <div className="flex items-center gap-3 truncate">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Alex Rivera'}</p>
                <p className="text-[11px] text-slate-400 truncate">{profile?.goal || 'Build Muscle'}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
