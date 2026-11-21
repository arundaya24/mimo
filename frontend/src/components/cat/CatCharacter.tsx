import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CatCustomization, PetState } from '../../types/pet';

interface CatCharacterProps {
  customization: CatCustomization;
  state: PetState;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showShadow?: boolean;
}

export const CatCharacter: React.FC<CatCharacterProps> = ({
  customization,
  state,
  onClick,
  className = '',
  size = 'lg',
  showShadow = true,
}) => {
  const {
    fur_color = '#E69A57',
    fur_secondary_color = '#FFF8F0',
    pattern = 'stripes',
    pattern_color = '#A0522D',
    eye_color = '#48BB78',
    ear_style = 'pointy',
    collar_color = '#D97746',
    bell = true,
    accessory = 'none',
  } = customization;

  const sizeDimensions = {
    sm: { width: 140, height: 130 },
    md: { width: 200, height: 185 },
    lg: { width: 280, height: 260 },
    xl: { width: 360, height: 330 },
  }[size];

  // Motion variants for whole cat body based on current state
  const bodyVariants: any = {
    idle: {
      y: [0, -4, 0],
      transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' },
    },
    walking: {
      x: [-12, 12, -12],
      y: [0, -6, 0, -6, 0],
      transition: { duration: 1.8, repeat: Infinity, ease: 'linear' },
    },
    sitting: {
      y: 0,
      scaleY: [1, 0.98, 1],
      transition: { duration: 4.0, repeat: Infinity, ease: 'easeInOut' },
    },
    sleeping: {
      scaleY: [1, 0.96, 1],
      y: [0, 2, 0],
      transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
    },
    eating: {
      y: [0, 6, 0, 6, 0],
      rotate: [-1, 2, -1],
      transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' },
    },
    playing: {
      y: [0, -18, 0, -10, 0],
      rotate: [-3, 4, -2, 3, 0],
      transition: { duration: 0.7, repeat: Infinity, ease: 'easeOut' },
    },
    happy: {
      y: [0, -8, 0],
      scale: [1, 1.03, 1],
      transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
    },
    scared: {
      x: [-3, 3, -3, 3, 0],
      scale: 0.92,
      transition: { duration: 0.2, repeat: Infinity },
    },
    angry: {
      x: [-2, 2, -2],
      y: [0, 2, 0],
      transition: { duration: 0.25, repeat: Infinity },
    },
    curious: {
      rotate: [0, 5, 0, -4, 0],
      y: [0, -5, 0],
      transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' },
    },
    affectionate: {
      y: [0, -4, 0],
      rotate: [-2, 3, -2],
      transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  // Tail animations
  const tailVariants: any = {
    idle: {
      rotate: [-4, 8, -4],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
    happy: {
      rotate: [-15, 20, -15],
      transition: { duration: 1.0, repeat: Infinity, ease: 'easeInOut' },
    },
    playing: {
      rotate: [-25, 30, -25],
      transition: { duration: 0.45, repeat: Infinity, ease: 'easeInOut' },
    },
    scared: {
      rotate: -15,
      scaleX: 1.2,
      transition: { duration: 0.2 },
    },
    angry: {
      rotate: [-35, 10, -35],
      transition: { duration: 0.35, repeat: Infinity, ease: 'linear' },
    },
    sleeping: {
      rotate: -5,
      transition: { duration: 1 },
    },
    affectionate: {
      rotate: [0, 16, 0],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  const isSleeping = state === 'sleeping';
  const isScared = state === 'scared';
  const isAngry = state === 'angry';
  const isCurious = state === 'curious';
  const isHappy = state === 'happy' || state === 'eating';
  const isAffectionate = state === 'affectionate';

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex flex-col items-center justify-center cursor-pointer select-none group ${className}`}
      style={{ width: sizeDimensions.width, height: sizeDimensions.height }}
    >
      {/* Dynamic Floor Shadow */}
      {showShadow && (
        <motion.div
          animate={{
            scaleX: isSleeping ? 1.2 : state === 'playing' ? [0.8, 1.1, 0.8] : [1, 0.95, 1],
            opacity: state === 'playing' ? [0.3, 0.15, 0.3] : [0.25, 0.3, 0.25],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute -bottom-2 w-4/5 h-6 bg-charcoal-900/20 rounded-full blur-sm"
        />
      )}

      {/* Interactive State Indicators (Pure Vector & Monospace, Zero Emojis) */}
      <AnimatePresence>
        {isAffectionate && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.5 }}
            animate={{ opacity: [0, 1, 0], y: -32, scale: [0.6, 1.1, 0.8] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, delay: 0.2 }}
            className="absolute -top-3 right-6 text-terracotta-500 pointer-events-none"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </motion.div>
        )}
        {isHappy && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], y: -24, scale: [0.5, 1, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
            className="absolute -top-2 left-8 text-amber-500 pointer-events-none"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
              <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
            </svg>
          </motion.div>
        )}
        {isSleeping && (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 0.9, 0], y: -28, x: [0, 6, 12] }}
            transition={{ duration: 2.4, repeat: Infinity }}
            className="absolute -top-4 right-10 text-brown-600 font-mono text-[11px] font-medium tracking-widest pointer-events-none uppercase"
          >
            zzz
          </motion.div>
        )}
        {isAngry && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 0], scale: [0.8, 1.1, 0.9], y: -18 }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute -top-3 left-6 text-rose-600 pointer-events-none"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </motion.div>
        )}
        {isScared && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0], y: -18 }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="absolute -top-4 right-8 text-sky-500 pointer-events-none"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main SVG Cat Character */}
      <motion.svg
        viewBox="0 0 240 220"
        className="w-full h-full filter drop-shadow-sm transition-transform duration-200"
        variants={bodyVariants}
        animate={state}
      >
        <defs>
          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#261F18" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* ================= 1. TAIL ================= */}
        <motion.g
          style={{ originX: '70px', originY: '170px' }}
          variants={tailVariants}
          animate={state in tailVariants ? state : 'idle'}
        >
          {isSleeping ? (
            // Curled tail around body
            <path
              d="M 60 170 C 40 185, 30 155, 45 140 C 55 130, 80 145, 75 165"
              fill="none"
              stroke={fur_color}
              strokeWidth="20"
              strokeLinecap="round"
            />
          ) : (
            // Upright dynamic tail
            <path
              d={
                isAngry
                  ? "M 65 160 C 35 155, 10 170, 15 190"
                  : isScared
                  ? "M 65 165 C 40 185, 20 185, 25 195"
                  : "M 68 160 C 35 150, 20 110, 42 85 C 48 78, 55 82, 52 90 C 38 120, 52 145, 72 165"
              }
              fill={isScared ? fur_color : 'none'}
              stroke={fur_color}
              strokeWidth={isScared ? "24" : "18"}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Tail Pattern Stripes / Socks */}
          {pattern === 'stripes' && !isSleeping && (
            <>
              <path d="M 40 100 Q 48 98 44 110" stroke={pattern_color} strokeWidth="5" strokeLinecap="round" />
              <path d="M 33 125 Q 42 120 40 135" stroke={pattern_color} strokeWidth="5" strokeLinecap="round" />
              <path d="M 48 145 Q 56 142 54 155" stroke={pattern_color} strokeWidth="5" strokeLinecap="round" />
            </>
          )}
          {pattern === 'socks' && (
            <circle cx="45" cy="85" r="9" fill={fur_secondary_color} />
          )}
        </motion.g>

        {/* ================= 2. MAIN BODY ================= */}
        <g id="bodyGroup">
          {/* Back body / rump */}
          <ellipse
            cx="120"
            cy="150"
            rx="56"
            ry="46"
            fill={fur_color}
            filter="url(#softShadow)"
          />

          {/* Calico Spots on Body */}
          {pattern === 'calico' && (
            <>
              <path
                d="M 85 130 Q 100 115 110 135 Q 95 155 85 130 Z"
                fill={pattern_color}
                opacity="0.9"
              />
              <path
                d="M 140 130 Q 155 120 165 140 Q 150 160 140 130 Z"
                fill="#2B2825"
                opacity="0.85"
              />
            </>
          )}

          {/* Tabby Stripes on Back */}
          {pattern === 'stripes' && (
            <g stroke={pattern_color} strokeWidth="6" strokeLinecap="round" opacity="0.85">
              <path d="M 100 120 Q 120 125 140 120" />
              <path d="M 96 135 Q 120 142 144 135" />
              <path d="M 98 150 Q 120 158 142 150" />
            </g>
          )}

          {/* Tuxedo Chest / Belly Patch */}
          {(pattern === 'tuxedo' || pattern === 'socks' || fur_secondary_color) && (
            <path
              d="M 100 140 C 100 125, 140 125, 140 140 C 140 170, 100 170, 100 140 Z"
              fill={fur_secondary_color}
            />
          )}

          {/* Paws / Feet */}
          {isSleeping ? (
            // Tucked Loaf Paws
            <g fill={pattern === 'socks' ? fur_secondary_color : fur_color}>
              <ellipse cx="98" cy="186" rx="14" ry="9" stroke="#E2D4C3" strokeWidth="1" />
              <ellipse cx="142" cy="186" rx="14" ry="9" stroke="#E2D4C3" strokeWidth="1" />
            </g>
          ) : (
            // Standing / Seated Paws
            <g>
              {/* Left Front Paw */}
              <ellipse
                cx="102"
                cy={state === 'walking' ? 182 : 188}
                rx="14"
                ry="10"
                fill={pattern === 'socks' ? fur_secondary_color : fur_color}
                stroke="#DFCDBA"
                strokeWidth="1"
              />
              {/* Right Front Paw (can bat/play) */}
              <motion.ellipse
                animate={
                  state === 'playing'
                    ? { cy: [188, 160, 188], cx: [138, 155, 138] }
                    : {}
                }
                transition={{ duration: 0.6, repeat: Infinity }}
                cx="138"
                cy="188"
                rx="14"
                ry="10"
                fill={pattern === 'socks' ? fur_secondary_color : fur_color}
                stroke="#DFCDBA"
                strokeWidth="1"
              />
              {/* Cute little toe dividers */}
              <path d="M 98 184 L 98 193 M 105 184 L 105 193" stroke="#C9B8A3" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 134 184 L 134 193 M 141 184 L 141 193" stroke="#C9B8A3" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          )}
        </g>

        {/* ================= 3. HEAD & EARS ================= */}
        <motion.g
          id="headGroup"
          animate={
            isCurious
              ? { rotate: [0, 8, 0, -6, 0] }
              : isAffectionate
              ? { rotate: [-2, 3, -2], y: [0, -3, 0] }
              : isAngry
              ? { y: [0, 2, 0] }
              : {}
          }
          style={{ originX: '120px', originY: '110px' }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* EARS */}
          <g id="ears">
            {ear_style === 'pointy' && (
              <>
                {/* Left Ear */}
                <motion.polygon
                  points="72,95 82,32 110,75"
                  fill={fur_color}
                  stroke="#DFCDBA"
                  strokeWidth="1"
                  animate={isAngry || isScared ? { rotate: -25, originX: '90px', originY: '85px' } : {}}
                />
                <polygon points="78,90 85,42 104,74" fill="#FBB6CE" opacity="0.75" />

                {/* Right Ear */}
                <motion.polygon
                  points="168,95 158,32 130,75"
                  fill={fur_color}
                  stroke="#DFCDBA"
                  strokeWidth="1"
                  animate={isAngry || isScared ? { rotate: 25, originX: '150px', originY: '85px' } : {}}
                />
                <polygon points="162,90 155,42 136,74" fill="#FBB6CE" opacity="0.75" />
              </>
            )}

            {ear_style === 'folded' && (
              <>
                {/* Scottish Fold Left Ear */}
                <path
                  d="M 72 90 C 70 58, 92 48, 102 65 C 92 82, 80 92, 72 90 Z"
                  fill={fur_color}
                  stroke="#DFCDBA"
                  strokeWidth="1"
                />
                <path d="M 76 86 C 75 66, 88 58, 96 68 Z" fill="#FBB6CE" opacity="0.7" />

                {/* Scottish Fold Right Ear */}
                <path
                  d="M 168 90 C 170 58, 148 48, 138 65 C 148 82, 160 92, 168 90 Z"
                  fill={fur_color}
                  stroke="#DFCDBA"
                  strokeWidth="1"
                />
                <path d="M 164 86 C 165 66, 152 58, 144 68 Z" fill="#FBB6CE" opacity="0.7" />
              </>
            )}

            {ear_style === 'round' && (
              <>
                {/* Round Rounded Ears */}
                <circle cx="85" cy="55" r="22" fill={fur_color} stroke="#DFCDBA" strokeWidth="1" />
                <circle cx="85" cy="55" r="14" fill="#FBB6CE" opacity="0.75" />

                <circle cx="155" cy="55" r="22" fill={fur_color} stroke="#DFCDBA" strokeWidth="1" />
                <circle cx="155" cy="55" r="14" fill="#FBB6CE" opacity="0.75" />
              </>
            )}
          </g>

          {/* HEAD BASE */}
          <ellipse
            cx="120"
            cy="105"
            rx="52"
            ry="44"
            fill={fur_color}
            filter="url(#softShadow)"
          />

          {/* Chubby Cheeks */}
          <ellipse cx="80" cy="115" rx="18" ry="14" fill={fur_color} />
          <ellipse cx="160" cy="115" rx="18" ry="14" fill={fur_color} />

          {/* Forehead Tabby Markings / Pattern */}
          {pattern === 'stripes' && (
            <g stroke={pattern_color} strokeWidth="3.5" strokeLinecap="round" opacity="0.8">
              <path d="M 120 70 L 120 82" />
              <path d="M 112 73 L 115 84" />
              <path d="M 128 73 L 125 84" />
            </g>
          )}

          {/* Calico Head Spot */}
          {pattern === 'calico' && (
            <path
              d="M 72 80 Q 95 65 105 85 Q 85 105 72 80 Z"
              fill={pattern_color}
              opacity="0.9"
            />
          )}

          {/* Rosy Cheeks (Blush) */}
          <ellipse cx="88" cy="116" rx="8" ry="5" fill="#F472B6" opacity={isHappy || isAffectionate ? "0.55" : "0.25"} />
          <ellipse cx="152" cy="116" rx="8" ry="5" fill="#F472B6" opacity={isHappy || isAffectionate ? "0.55" : "0.25"} />

          {/* ================= 4. EYES ================= */}
          <g id="eyes">
            {isSleeping ? (
              // Sleeping peaceful eyes (^  ^)
              <g stroke="#3C3229" strokeWidth="3.5" strokeLinecap="round" fill="none">
                <path d="M 94 104 Q 102 112 110 104" />
                <path d="M 130 104 Q 138 112 146 104" />
              </g>
            ) : isHappy ? (
              // Joyful squinting eyes
              <g stroke="#3C3229" strokeWidth="4" strokeLinecap="round" fill="none">
                <path d="M 92 106 Q 102 96 112 106" />
                <path d="M 128 106 Q 138 96 148 106" />
              </g>
            ) : isAngry ? (
              // Angry fierce angled eyes
              <g>
                <path d="M 92 97 L 112 104" stroke="#3C3229" strokeWidth="3" strokeLinecap="round" />
                <path d="M 148 97 L 128 104" stroke="#3C3229" strokeWidth="3" strokeLinecap="round" />
                {/* Left Eye */}
                <ellipse cx="102" cy="106" rx="8" ry="10" fill={eye_color} />
                <ellipse cx="102" cy="106" rx="2.5" ry="9" fill="#1F1D1B" />
                {/* Right Eye */}
                <ellipse cx="138" cy="106" rx="8" ry="10" fill={eye_color} />
                <ellipse cx="138" cy="106" rx="2.5" ry="9" fill="#1F1D1B" />
              </g>
            ) : isScared ? (
              // Scared wide shaking eyes
              <g>
                <circle cx="102" cy="104" r="11" fill="#FFFFFF" stroke="#3C3229" strokeWidth="2" />
                <circle cx="102" cy="104" r="7" fill={eye_color} />
                <circle cx="102" cy="104" r="4" fill="#1F1D1B" />
                <circle cx="100" cy="102" r="1.5" fill="#FFFFFF" />

                <circle cx="138" cy="104" r="11" fill="#FFFFFF" stroke="#3C3229" strokeWidth="2" />
                <circle cx="138" cy="104" r="7" fill={eye_color} />
                <circle cx="138" cy="104" r="4" fill="#1F1D1B" />
                <circle cx="136" cy="102" r="1.5" fill="#FFFFFF" />
              </g>
            ) : isAffectionate ? (
              // Loving half-closed eyes with heart sparkle
              <g>
                <ellipse cx="102" cy="105" rx="10" ry="8" fill={eye_color} />
                <circle cx="102" cy="105" r="5" fill="#1F1D1B" />
                <circle cx="100" cy="103" r="2.5" fill="#FFFFFF" />
                <path d="M 92 100 Q 102 96 112 100" stroke="#3C3229" strokeWidth="3" strokeLinecap="round" fill="none" />

                <ellipse cx="138" cy="105" rx="10" ry="8" fill={eye_color} />
                <circle cx="138" cy="105" r="5" fill="#1F1D1B" />
                <circle cx="136" cy="103" r="2.5" fill="#FFFFFF" />
                <path d="M 128 100 Q 138 96 148 100" stroke="#3C3229" strokeWidth="3" strokeLinecap="round" fill="none" />
              </g>
            ) : (
              // Standard / Idle / Curious Eyes (Wide expressive anime eyes)
              <g>
                {/* Left Eye */}
                <ellipse cx="102" cy="104" rx={isCurious ? "11" : "10"} ry={isCurious ? "12" : "11"} fill={eye_color} />
                <ellipse cx="102" cy="104" rx={isCurious ? "7" : "5.5"} ry={isCurious ? "9" : "8"} fill="#1A1817" />
                {/* Highlights */}
                <circle cx="100" cy="101" r="3.5" fill="#FFFFFF" />
                <circle cx="104" cy="107" r="1.5" fill="#FFFFFF" />

                {/* Right Eye */}
                <ellipse cx="138" cy="104" rx={isCurious ? "11" : "10"} ry={isCurious ? "12" : "11"} fill={eye_color} />
                <ellipse cx="138" cy="104" rx={isCurious ? "7" : "5.5"} ry={isCurious ? "9" : "8"} fill="#1A1817" />
                {/* Highlights */}
                <circle cx="136" cy="101" r="3.5" fill="#FFFFFF" />
                <circle cx="140" cy="107" r="1.5" fill="#FFFFFF" />
              </g>
            )}
          </g>

          {/* ================= 5. NOSE, MOUTH & WHISKERS ================= */}
          {/* Nose */}
          <polygon points="117,114 123,114 120,118" fill="#F472B6" />

          {/* Mouth */}
          {state === 'eating' ? (
            // Chomping open mouth
            <ellipse cx="120" cy="122" rx="5" ry="4" fill="#C53030" />
          ) : isAngry ? (
            // Hissing mouth
            <path d="M 115 120 Q 120 126 125 120" stroke="#3C3229" strokeWidth="2.5" fill="#742A2A" />
          ) : isScared ? (
            // Quivering small 'o'
            <circle cx="120" cy="122" r="3" fill="#E2A599" stroke="#3C3229" strokeWidth="1.5" />
          ) : (
            // Cute ':3' cat mouth
            <path
              d="M 113 120 Q 117 124 120 120 Q 123 124 127 120"
              stroke="#3C3229"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
          )}

          {/* Whiskers */}
          <g stroke="#5C4D41" strokeWidth="1.4" strokeLinecap="round" opacity="0.6">
            {/* Left Whiskers */}
            <line x1="88" y1="117" x2="60" y2="114" />
            <line x1="88" y1="121" x2="62" y2="124" />
            {/* Right Whiskers */}
            <line x1="152" y1="117" x2="180" y2="114" />
            <line x1="152" y1="121" x2="178" y2="124" />
          </g>

          {/* ================= 6. COLLAR & BELL ================= */}
          {collar_color && collar_color !== 'none' && (
            <g id="collar">
              <path
                d="M 96 142 Q 120 152 144 142"
                stroke={collar_color}
                strokeWidth="7"
                strokeLinecap="round"
                fill="none"
              />
              {bell && (
                <g transform="translate(120, 149)">
                  <circle cx="0" cy="0" r="5.5" fill="#ECC94B" stroke="#D69E2E" strokeWidth="1" />
                  <circle cx="0" cy="1" r="1.2" fill="#744210" />
                  <line x1="-3" y1="-1" x2="3" y2="-1" stroke="#B7791F" strokeWidth="1" />
                </g>
              )}
            </g>
          )}

          {/* ================= 7. ACCESSORIES ================= */}
          {accessory === 'bow' && (
            <g transform="translate(120, 146)">
              {/* Bow on collar */}
              <polygon points="0,0 -14,-7 -14,7" fill="#E53E3E" />
              <polygon points="0,0 14,-7 14,7" fill="#E53E3E" />
              <circle cx="0" cy="0" r="4" fill="#C53030" />
            </g>
          )}

          {accessory === 'flower' && (
            <g transform="translate(74, 62)">
              {/* Daisy behind left ear */}
              {[0, 72, 144, 216, 288].map((angle, idx) => (
                <ellipse
                  key={idx}
                  cx="0"
                  cy="0"
                  rx="4"
                  ry="8"
                  fill="#FFFFFF"
                  transform={`rotate(${angle})`}
                />
              ))}
              <circle cx="0" cy="0" r="4.5" fill="#ECC94B" />
            </g>
          )}

          {accessory === 'glasses' && (
            <g id="glasses" stroke="#2B2825" strokeWidth="2.5" fill="none">
              <circle cx="102" cy="104" r="12" fill="rgba(255, 255, 255, 0.2)" />
              <circle cx="138" cy="104" r="12" fill="rgba(255, 255, 255, 0.2)" />
              <line x1="114" y1="104" x2="126" y2="104" />
            </g>
          )}

          {accessory === 'scarf' && (
            <g id="scarf">
              <path
                d="M 94 140 Q 120 154 146 140"
                stroke="#C53030"
                strokeWidth="12"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 132 146 L 138 172 L 148 170 L 142 144"
                fill="#C53030"
              />
              <line x1="138" y1="172" x2="148" y2="170" stroke="#FFFFFF" strokeWidth="2" />
            </g>
          )}
        </motion.g>
      </motion.svg>
    </div>
  );
};
