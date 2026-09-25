import React from 'react';

export const LoadingSkeleton = ({ count = 3, height = 'h-24', className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`w-full ${height} rounded-2xl bg-slate-800/40 border border-slate-800 animate-pulse`}
        />
      ))}
    </div>
  );
};

export const Spinner = ({ size = 'w-5 h-5', text = 'Loading...' }) => {
  return (
    <div className="flex items-center justify-center gap-3 py-6 text-slate-400 text-sm">
      <div className={`${size} border-2 border-cyan-400 border-t-transparent rounded-full animate-spin`} />
      {text && <span>{text}</span>}
    </div>
  );
};

export default LoadingSkeleton;
