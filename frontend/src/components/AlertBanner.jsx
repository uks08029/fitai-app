import React from 'react';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const AlertBanner = ({ type = 'info', message, title, onClose, className = '' }) => {
  const configs = {
    warning: {
      bg: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
    },
    error: {
      bg: 'bg-rose-500/10 border-rose-500/20 text-rose-300',
      icon: AlertCircle,
      iconColor: 'text-rose-400',
    },
    info: {
      bg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300',
      icon: Info,
      iconColor: 'text-cyan-400',
    },
  };

  const current = configs[type] || configs.info;
  const Icon = current.icon;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${current.bg} ${className} transition-all`}>
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${current.iconColor}`} />
      <div className="flex-1 text-xs sm:text-sm">
        {title && <h5 className="font-bold text-white mb-0.5">{title}</h5>}
        <p className="leading-relaxed">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default AlertBanner;
