import React from 'react';

export const StatCard = ({
  title,
  value,
  unit,
  icon: Icon,
  iconColor = 'text-cyan-400',
  iconBg = 'bg-cyan-500/10 border-cyan-500/20',
  subtext,
  badge,
  badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  progressPercentage,
  progressBarColor = 'from-cyan-400 to-blue-500',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden p-5 rounded-2xl glass-card glass-card-hover border border-slate-800/80 transition-all ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">{title}</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{value}</span>
            {unit && <span className="text-sm font-semibold text-slate-400">{unit}</span>}
          </div>
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl border ${iconBg} ${iconColor} shadow-md`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Optional Progress Bar */}
      {progressPercentage !== undefined && (
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Progress</span>
            <span className="font-semibold text-slate-200">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${progressBarColor} transition-all duration-500 ease-out`}
              style={{ width: `${Math.min(100, Math.max(0, progressPercentage))}%` }}
            />
          </div>
        </div>
      )}

      {/* Optional Subtext or Badge */}
      {(subtext || badge) && (
        <div className="mt-3.5 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/50">
          <span>{subtext}</span>
          {badge && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
