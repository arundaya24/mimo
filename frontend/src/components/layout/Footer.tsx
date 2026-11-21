import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#E7E2DA] dark:border-[#2D2A26] py-6 px-4 bg-[#F8F6F1] dark:bg-[#121110] text-xs text-[#756A5E] dark:text-[#B5ACA1] transition-colors">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-bold tracking-tight text-[#22201D] dark:text-[#F6F4EE]">MIMO</span>
          <span className="font-mono text-[11px] text-[#9E9284] dark:text-[#7E756B]">VER 1.0.4</span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
            OPERATIONAL
          </span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px] text-[#9E9284] dark:text-[#7E756B]">
          <span>DETERMINISTIC PET ENGINE</span>
          <span>LATENCY &lt; 20MS</span>
          <span>REST API</span>
        </div>
      </div>
    </footer>
  );
};
