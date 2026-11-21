import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CatSpeechBubbleProps {
  thought: string;
  state: string;
  catName: string;
}

export const CatSpeechBubble: React.FC<CatSpeechBubbleProps> = ({ thought, state, catName }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={thought + state}
        initial={{ opacity: 0, y: 8, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className="relative bg-white/95 backdrop-blur-sm border-2 border-cream-300 rounded-2xl px-4 py-2.5 shadow-md max-w-xs sm:max-w-md mx-auto text-center"
      >
        {/* Little Bubble Tail */}
        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-cream-300 transform rotate-45" />

        <div className="flex items-center justify-center gap-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-terracotta-600 bg-terracotta-50 px-2 py-0.5 rounded-full border border-terracotta-200">
            {catName}
          </span>
          <p className="text-sm text-charcoal-700 font-medium italic">
            "{thought}"
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
