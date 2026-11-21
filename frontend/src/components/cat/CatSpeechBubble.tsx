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
        className="relative bg-[#FCFBF8] border border-[#E7E2DA] rounded-lg px-4 py-2.5 max-w-sm sm:max-w-md mx-auto text-left shadow-2xs"
      >
        <div className="flex items-start gap-2.5">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#C75D35] bg-[#FDF6F2] px-2 py-0.5 rounded border border-[#EBCBBD] shrink-0 mt-0.5">
            {catName}
          </span>
          <p className="text-xs text-[#322F2B] font-medium leading-relaxed">
            "{thought}"
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
