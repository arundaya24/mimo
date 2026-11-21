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
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative bg-[#FCFBF8] dark:bg-[#181615] border border-[#E7E2DA] dark:border-[#2D2A26] rounded-lg px-4 py-2.5 max-w-sm sm:max-w-md mx-auto text-left shadow-2xs transition-colors"
      >
        <div className="flex items-start gap-2.5">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)] bg-[#FDF6F2] dark:bg-[#2A1810] px-2 py-0.5 rounded border border-[#EBCBBD] dark:border-[#522918] shrink-0 mt-0.5">
            {catName}
          </span>
          <p className="text-xs text-[#322F2B] dark:text-[#F6F4EE] font-medium leading-relaxed">
            "{thought}"
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
