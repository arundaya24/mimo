import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#E7E2DA] py-6 px-4 bg-[#F8F6F1] text-xs text-[#756A5E]">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-bold tracking-tight text-[#22201D]">MIMO</span>
          <span className="font-mono text-[11px] text-[#9E9284]">VER 1.0.4</span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            OPERATIONAL
          </span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px] text-[#9E9284]">
          <span>DETERMINISTIC PET ENGINE</span>
          <span>LATENCY &lt; 20MS</span>
          <span>REST API</span>
        </div>
      </div>
    </footer>
  );
};
