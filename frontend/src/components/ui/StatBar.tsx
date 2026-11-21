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
      bar: 'bg-[#C75D35] dark:bg-[#D76C43]',
      badge: 'text-[#C75D35] dark:text-[#D76C43] bg-[#FDF6F2] dark:bg-[#2A1810] border-[#EBCBBD] dark:border-[#522918]',
    },
    sage: {
      bar: 'bg-[#4A7C59] dark:bg-[#5B946D]',
      badge: 'text-[#4A7C59] dark:text-[#5B946D] bg-[#F1F6F2] dark:bg-[#142318] border-[#CDE0D2] dark:border-[#22442C]',
    },
    amber: {
      bar: 'bg-[#B88728] dark:bg-[#F59E0B]',
      badge: 'text-[#B88728] dark:text-[#F59E0B] bg-[#FBF7EE] dark:bg-[#2A200B] border-[#ECDDBF] dark:border-[#543D10]',
    },
    slate: {
      bar: 'bg-[#6B7280] dark:bg-[#9CA3AF]',
      badge: 'text-[#4B5563] dark:text-[#CBD5E1] bg-[#F3F4F6] dark:bg-[#1E232B] border-[#E5E7EB] dark:border-[#333D4B]',
    },
    charcoal: {
      bar: 'bg-[#2E2721] dark:bg-[#E2D9CC]',
      badge: 'text-[#2E2721] dark:text-[#E2D9CC] bg-[#F5F2ED] dark:bg-[#26211C] border-[#DDD5C9] dark:border-[#423B33]',
    },
    rose: {
      bar: 'bg-[#A84534] dark:bg-[#F43F5E]',
      badge: 'text-[#A84534] dark:text-[#F43F5E] bg-[#FBF2F0] dark:bg-[#2D1217] border-[#ECC4BD] dark:border-[#5C232E]',
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
        <div className="flex items-center gap-2 font-medium text-[#22201D] dark:text-[#F6F4EE]">
          <span className="p-1 rounded border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#F8F6F1] dark:bg-[#1E1C1A] text-[#5A5046] dark:text-[#B5ACA1]">
            {icon}
          </span>
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#433B33] dark:text-[#B5ACA1]">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono">
          <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${colorStyles.badge}`}>
            {displayStatus}
          </span>
          <span className="text-[11px] font-semibold text-[#141311] dark:text-[#F6F4EE] tabular-nums">
            {clampedValue}%
          </span>
        </div>
      </div>

      {/* Track */}
      <div className="w-full h-1.5 bg-[#E7E2DA] dark:bg-[#2D2A26] rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${colorStyles.bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {hint && (
        <span className="font-mono text-[10px] text-[#9E9284] dark:text-[#7E756B] leading-tight">
          {hint}
        </span>
      )}
    </div>
  );
};
