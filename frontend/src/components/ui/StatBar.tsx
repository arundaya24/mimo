import React from 'react';
import { motion } from 'framer-motion';

interface StatBarProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'orange' | 'green' | 'blue' | 'yellow' | 'purple' | 'red';
  hint?: string;
  isHunger?: boolean;
}

export const StatBar: React.FC<StatBarProps> = ({
  label,
  value,
  icon,
  color,
  hint,
  isHunger = false,
}) => {
  const clampedValue = Math.min(100, Math.max(0, Math.round(value)));

  const colorStyles = {
    orange: {
      bar: 'bg-gradient-to-r from-terracotta-400 to-terracotta-500',
      text: 'text-terracotta-700',
      bg: 'bg-terracotta-100',
    },
    green: {
      bar: 'bg-gradient-to-r from-emerald-400 to-emerald-500',
      text: 'text-emerald-700',
      bg: 'bg-emerald-100',
    },
    blue: {
      bar: 'bg-gradient-to-r from-sky-400 to-blue-500',
      text: 'text-blue-700',
      bg: 'bg-blue-100',
    },
    yellow: {
      bar: 'bg-gradient-to-r from-amber-400 to-honey-500',
      text: 'text-amber-800',
      bg: 'bg-amber-100',
    },
    purple: {
      bar: 'bg-gradient-to-r from-purple-400 to-indigo-500',
      text: 'text-purple-700',
      bg: 'bg-purple-100',
    },
    red: {
      bar: 'bg-gradient-to-r from-rose-400 to-red-500',
      text: 'text-rose-700',
      bg: 'bg-rose-100',
    },
  }[color];

  // For hunger: 0 is full (great), 100 is starving (bad)
  // For other stats: 100 is great, 0 is bad
  const displayStatus = isHunger
    ? clampedValue <= 25
      ? 'Kenyang'
      : clampedValue <= 60
      ? 'Normal'
      : clampedValue <= 80
      ? 'Lapar'
      : 'Sangat Lapar!'
    : clampedValue >= 80
    ? 'Tinggi'
    : clampedValue >= 50
    ? 'Cukup'
    : clampedValue >= 25
    ? 'Rendah'
    : 'Kritis!';

  return (
    <div className="flex flex-col gap-1 w-full bg-white/70 backdrop-blur-2xs p-2.5 rounded-2xl border border-cream-200 shadow-2xs hover:border-cream-300 transition-all">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-medium text-charcoal-700">
          <span className={`p-1 rounded-lg ${colorStyles.bg} ${colorStyles.text}`}>
            {icon}
          </span>
          <span>{label}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-brown-500 font-normal">({displayStatus})</span>
          <span className="font-semibold text-charcoal-800 tabular-nums">{clampedValue}%</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full h-2.5 bg-cream-300/60 rounded-full overflow-hidden p-0.5">
        <motion.div
          className={`h-full rounded-full ${colorStyles.bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      {hint && (
        <span className="text-[10px] text-brown-400 italic px-0.5">
          {hint}
        </span>
      )}
    </div>
  );
};
