import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-cream-300 py-6 px-4 bg-cream-50/70 text-center text-xs text-brown-500">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-heading font-semibold text-charcoal-800">MIMO</span>
          <span>— A little life to care for.</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-brown-400">
          <span>Virtual Pet Simulator</span>
          <span>•</span>
          <span>Crafted with warm care & curiosity</span>
        </div>
      </div>
    </footer>
  );
};
