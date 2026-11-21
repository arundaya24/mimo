import React from 'react';
import { motion } from 'framer-motion';

interface StatBarProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'terracotta' | 'sage' | 'amber' | 'slate' | 'charcoal' | 'rose';
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
    terracotta: {
      bar: 'bg-[#C75D35]',
      badge: 'text-[#C75D35] bg-[#FDF6F2] border-[#EBCBBD]',
    },
    sage: {
      bar: 'bg-[#4A7C59]',
      badge: 'text-[#4A7C59] bg-[#F1F6F2] border-[#CDE0D2]',
    },
    amber: {
      bar: 'bg-[#B88728]',
      badge: 'text-[#B88728] bg-[#FBF7EE] border-[#ECDDBF]',
    },
    slate: {
      bar: 'bg-[#6B7280]',
      badge: 'text-[#4B5563] bg-[#F3F4F6] border-[#E5E7EB]',
    },
    charcoal: {
      bar: 'bg-[#2E2721]',
      badge: 'text-[#2E2721] bg-[#F5F2ED] border-[#DDD5C9]',
    },
    rose: {
      bar: 'bg-[#A84534]',
      badge: 'text-[#A84534] bg-[#FBF2F0] border-[#ECC4BD]',
    },
  }[color];

  const displayStatus = isHunger
    ? clampedValue <= 25
      ? 'KENYANG'
      : clampedValue <= 60
      ? 'OPTIMAL'
      : clampedValue <= 80
      ? 'LAPAR'
      : 'KRITIS'
    : clampedValue >= 80
    ? 'TINGGI'
    : clampedValue >= 50
    ? 'OPTIMAL'
    : clampedValue >= 25
    ? 'RENDAH'
    : 'KRITIS';

  return (
    <div className="bento-card p-3 rounded-lg flex flex-col gap-2 text-left">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-medium text-[#22201D]">
          <span className="p-1 rounded border border-[#E7E2DA] bg-[#F8F6F1] text-[#5A5046]">
            {icon}
          </span>
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#433B33]">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono">
          <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${colorStyles.badge}`}>
            {displayStatus}
          </span>
          <span className="text-[11px] font-semibold text-[#141311] tabular-nums">
            {clampedValue}%
          </span>
        </div>
      </div>

      {/* Track */}
      <div className="w-full h-1.5 bg-[#E7E2DA] rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${colorStyles.bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {hint && (
        <span className="font-mono text-[10px] text-[#9E9284] leading-tight">
          {hint}
        </span>
      )}
    </div>
  );
};
