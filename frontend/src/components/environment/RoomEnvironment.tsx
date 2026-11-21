import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PetState, CatCustomization, CatStats, CatPersonality } from '../../types/pet';
import { CatCharacter } from '../cat/CatCharacter';
import { Sun, Moon, CloudSun, Home, Bed, Trees, CircleDot, Info, Sparkles, Utensils } from 'lucide-react';
import { sounds } from '../../audio/soundSynth';

interface RoomEnvironmentProps {
  customization: CatCustomization;
  state: PetState;
  catName: string;
  isSleeping: boolean;
  stats?: CatStats;
  personality?: CatPersonality;
  onCatClick: () => void;
  onObjectClick: (objectType: string) => void;
  currentRoom?: string;
  onRoomChange?: (room: string) => void;
}

type Waypoint = 'bed' | 'window' | 'rug' | 'front' | 'toy' | 'bowl';

export const RoomEnvironment: React.FC<RoomEnvironmentProps> = ({
  customization,
  state: externalState,
  catName,
  isSleeping,
  stats,
  personality,
  onCatClick,
  onObjectClick,
  currentRoom = 'living_room',
  onRoomChange,
}) => {
  const currentHour = new Date().getHours();
  const timeOfDay = currentHour >= 6 && currentHour < 16 ? 'day' : currentHour >= 16 && currentHour < 19 ? 'sunset' : 'night';

  const [currentWaypoint, setCurrentWaypoint] = useState<Waypoint>(isSleeping ? 'bed' : 'rug');
  const [internalState, setInternalState] = useState<PetState>(externalState);
  const [facingDirection, setFacingDirection] = useState<1 | -1>(1); // 1 = right, -1 = left
  const [isWalking, setIsWalking] = useState(false);
  const lastExternalStateRef = useRef(externalState);

  // Waypoint coordinate mappings (in pixels offset from center)
  const waypointCoordinates: Record<Waypoint, { x: number; y: number }> = {
    bed: { x: -150, y: 0 },
    window: { x: -80, y: -6 },
    rug: { x: 0, y: 0 },
    front: { x: 0, y: 14 },
    toy: { x: 90, y: 0 },
    bowl: { x: 155, y: 0 },
  };

  // Sync when sleeping state changes externally
  useEffect(() => {
    if (isSleeping) {
      setCurrentWaypoint('bed');
      setInternalState('sleeping');
    }
  }, [isSleeping]);

  // Sync when user performs an action externally (feed, play, etc.)
  useEffect(() => {
    if (externalState !== lastExternalStateRef.current) {
      lastExternalStateRef.current = externalState;
      if (externalState === 'eating') {
        moveToWaypoint('bowl', 'eating');
      } else if (externalState === 'playing') {
        moveToWaypoint('toy', 'playing');
      } else if (externalState === 'sleeping') {
        moveToWaypoint('bed', 'sleeping');
      } else if (externalState === 'affectionate') {
        moveToWaypoint('front', 'affectionate');
      } else {
        setInternalState(externalState);
      }
    }
  }, [externalState]);

  // Function to move cat to a waypoint with walk cycle
  const moveToWaypoint = (target: Waypoint, arrivalState: PetState = 'idle') => {
    if (target === currentWaypoint && internalState === arrivalState) return;

    const startX = waypointCoordinates[currentWaypoint].x;
    const targetX = waypointCoordinates[target].x;

    if (targetX > startX) {
      setFacingDirection(1); // Face right
    } else if (targetX < startX) {
      setFacingDirection(-1); // Face left
    }

    setIsWalking(true);
    setInternalState('walking');
    setCurrentWaypoint(target);

    // After walking duration, arrive at destination
    setTimeout(() => {
      setIsWalking(false);
      setInternalState(arrivalState);
    }, 1800);
  };

  // Autonomous Behavior Loop
  useEffect(() => {
    // If user is currently doing an action or cat is sleeping, don't interrupt
    if (isSleeping || isWalking) return;

    const autonomousTimer = setInterval(() => {
      // Evaluate internal conditions
      const currentHunger = stats?.hunger ?? 20;
      const currentEnergy = stats?.energy ?? 80;
      const currentCleanliness = stats?.cleanliness ?? 90;
      const currentAffection = stats?.affection ?? 60;
      const pCode = personality?.code || 'playful';

      // 1. If very hungry, cat wanders over to the bowl to inspect it
      if (currentHunger > 65 && currentWaypoint !== 'bowl') {
        moveToWaypoint('bowl', 'curious');
        return;
      }

      // 2. If very tired, wander to bed unit
      if (currentEnergy < 25 && currentWaypoint !== 'bed') {
        moveToWaypoint('bed', 'sitting');
        return;
      }

      // 3. If grooming needed (cleanliness low), sit down and groom
      if (currentCleanliness < 45 && internalState !== 'grooming') {
        moveToWaypoint('rug', 'grooming');
        return;
      }

      // 4. Personality-driven wandering
      const rand = Math.random();
      if (pCode === 'playful' && rand < 0.45 && currentWaypoint !== 'toy') {
        moveToWaypoint('toy', 'playing');
      } else if (pCode === 'lazy' && rand < 0.5) {
        moveToWaypoint(rand < 0.25 ? 'bed' : 'rug', 'sitting');
      } else if (pCode === 'affectionate' && currentAffection > 50 && rand < 0.4) {
        moveToWaypoint('front', 'affectionate');
      } else {
        // General natural roaming
        const candidates: Waypoint[] = ['rug', 'window', 'toy', 'front'];
        const filtered = candidates.filter((w) => w !== currentWaypoint);
        const nextTarget = filtered[Math.floor(Math.random() * filtered.length)];
        const nextState: PetState = rand < 0.3 ? 'sitting' : rand < 0.6 ? 'curious' : 'idle';
        moveToWaypoint(nextTarget, nextState);
      }
    }, 14000 + Math.random() * 6000);

    return () => clearInterval(autonomousTimer);
  }, [currentWaypoint, isSleeping, isWalking, internalState, stats, personality]);

  const roomStyles = {
    day: {
      windowSky: 'from-[#CFE4EE] to-[#E9DFCE]',
      ambient: 'bg-[#FCFBF8] dark:bg-[#181615]',
    },
    sunset: {
      windowSky: 'from-[#DFA58E] via-[#E8C29D] to-[#E8DCCB]',
      ambient: 'bg-[#FAF6F0] dark:bg-[#181615]',
    },
    night: {
      windowSky: 'from-[#1C2331] via-[#2A3447] to-[#1F2735]',
      ambient: 'bg-[#F4F1EA] dark:bg-[#121110]',
    },
  }[timeOfDay];

  const rooms = [
    { id: 'living_room', label: 'LIVING ROOM', code: 'RM-01', icon: Home },
    { id: 'bedroom', label: 'BEDROOM', code: 'RM-02', icon: Bed },
    { id: 'balcony', label: 'BALCONY', code: 'RM-03', icon: Trees },
  ];

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-xl border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#181615] p-4 sm:p-5 transition-colors duration-200 text-left">
      
      {/* Top Header Bar: Room Switcher & Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 z-20 relative">
        <div className="flex items-center gap-1 p-0.5 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#F8F6F1] dark:bg-[#1E1C1A]">
          {rooms.map((room) => {
            const Icon = room.icon;
            const isSelected = currentRoom === room.id;
            return (
              <button
                key={room.id}
                onClick={() => {
                  sounds.playClick();
                  onRoomChange?.(room.id);
                }}
                className={`btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-[11px] font-medium transition-colors ${
                  isSelected
                    ? 'bg-[#FCFBF8] dark:bg-[#181615] text-[#22201D] dark:text-[#F6F4EE] border border-[#E7E2DA] dark:border-[#2D2A26] font-semibold'
                    : 'text-[#756A5E] dark:text-[#B5ACA1] hover:text-[#22201D] dark:hover:text-[#F6F4EE]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{room.label}</span>
              </button>
            );
          })}
        </div>

        {/* Ambient Time Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#181615] font-mono text-[11px] text-[#5A5046] dark:text-[#B5ACA1]">
          {timeOfDay === 'day' && (
            <>
              <Sun className="w-3.5 h-3.5 text-[#B88728]" />
              <span>DAYLIGHT 100%</span>
            </>
          )}
          {timeOfDay === 'sunset' && (
            <>
              <CloudSun className="w-3.5 h-3.5 text-[#C75D35]" />
              <span>DUSK AMBIENT</span>
            </>
          )}
          {timeOfDay === 'night' && (
            <>
              <Moon className="w-3.5 h-3.5 text-[#7E756B]" />
              <span>NIGHT MODE</span>
            </>
          )}
        </div>
      </div>

      {/* Main Room Canvas */}
      <div className="relative w-full h-[360px] sm:h-[400px] rounded-lg overflow-hidden border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#F4F0E8] dark:bg-[#1A1816] flex flex-col justify-between">
        
        {/* Architectural Back Wall Elements */}
        <div className="absolute inset-0 flex justify-between p-6 pointer-events-none">
          {/* Wall Window with Clean Geometric Panes */}
          <div className="relative w-28 sm:w-32 h-36 sm:h-40 rounded-t-lg border border-[#D5CDC2] dark:border-[#38332E] bg-[#FAF8F5] dark:bg-[#1E1C1A] overflow-hidden">
            <div className={`w-full h-full bg-gradient-to-b ${roomStyles.windowSky} relative flex items-center justify-center`}>
              {timeOfDay === 'night' ? (
                <div className="w-5 h-5 rounded-full bg-[#E7E2DA] opacity-80" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#E5B558] opacity-75" />
              )}
              {/* Window Mullions Grid */}
              <div className="absolute inset-0 border-r border-[#FAF8F5]/70 dark:border-white/20 left-1/2" />
              <div className="absolute inset-0 border-b border-[#FAF8F5]/70 dark:border-white/20 top-1/2" />
            </div>
            {/* Sill */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#D5CDC2] dark:bg-[#38332E]" />
          </div>

          {/* Minimalist Wall Frame */}
          <div className="hidden sm:block p-2 bg-[#FAF8F5] dark:bg-[#1E1C1A] border border-[#D5CDC2] dark:border-[#38332E] rounded w-20 h-24">
            <div className="w-full h-14 bg-[#E7E2DA] dark:bg-[#282420] rounded flex items-center justify-center font-mono text-[9px] text-[#756A5E] dark:text-[#B5ACA1]">
              SPEC
            </div>
            <div className="font-mono text-[9px] text-center text-[#756A5E] dark:text-[#B5ACA1] mt-1.5 uppercase tracking-wider">
              {catName}
            </div>
          </div>

          {/* Clean Hanging Shelf */}
          <div className="relative w-32 h-2 bg-[#D5CDC2] dark:bg-[#38332E] rounded-xs top-6">
            <div className="absolute -top-4 left-3 flex gap-1 items-end">
              <div className="w-2 h-4 bg-[#C75D35] rounded-2xs" />
              <div className="w-2 h-5 bg-[#4A7C59] rounded-2xs" />
              <div className="w-2 h-3.5 bg-[#756A5E] rounded-2xs" />
            </div>
          </div>
        </div>

        {/* Floor Transition & Clean Planks */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-[#E8DFCFC0] dark:bg-[#201D1A] border-t border-[#D5CDC2] dark:border-[#38332E]">
          <div className="w-full h-full opacity-15 bg-[linear-gradient(90deg,transparent_49%,rgba(34,32,29,0.3)_50%,transparent_51%)] dark:bg-[linear-gradient(90deg,transparent_49%,rgba(255,255,255,0.15)_50%,transparent_51%)] bg-[length:100px_100%]" />
        </div>

        {/* Interactive Floor Objects & Center Rug */}
        <div className="relative w-full h-full flex items-end justify-between px-4 sm:px-10 pb-4 z-10 pointer-events-auto">

          {/* 1. Bed Unit (Left) */}
          <div
            onClick={() => {
              sounds.playClick();
              onObjectClick('bed');
            }}
            className="cursor-pointer group flex flex-col items-center btn-press z-10"
            title="Tempat Tidur (Klik untuk tidur atau bangun)"
          >
            <div className="relative w-24 sm:w-28 h-12 sm:h-14 rounded-full bg-[#DACDBE] dark:bg-[#2A2622] border border-[#BDB2A6] dark:border-[#423C36] flex items-center justify-center transition-colors group-hover:border-[var(--accent)]">
              <div className="w-4/5 h-4/5 rounded-full bg-[#EAE2D7] dark:bg-[#332E28] border border-[#D5CDC2] dark:border-[#48423B] flex items-center justify-center">
                <Bed className="w-3.5 h-3.5 text-[#756A5E] dark:text-[#B5ACA1]" />
              </div>
              {isSleeping && (
                <div className="absolute -top-3 font-mono text-[9px] font-semibold text-[var(--accent)] bg-[#FCFBF8] dark:bg-[#181615] border border-[#E7E2DA] dark:border-[#2D2A26] px-1.5 py-0.2 rounded">
                  ASLEEP
                </div>
              )}
            </div>
            <span className="font-mono text-[10px] text-[#756A5E] dark:text-[#B5ACA1] group-hover:text-[#22201D] dark:group-hover:text-[#F6F4EE] transition-colors mt-1.5 uppercase tracking-wider">
              BED UNIT
            </span>
          </div>

          {/* 2. Center Area: Floor Rug */}
          <div className="relative flex flex-col items-center justify-end -mb-2 pointer-events-none">
            <div className="w-48 sm:w-64 h-16 sm:h-20 rounded-[50%] bg-[#EFE9DF] dark:bg-[#25221F] border border-[#D5CDC2] dark:border-[#38332E]" />
          </div>

          {/* 3. Right Side: Food Bowl + Toy */}
          <div className="flex items-end gap-3 sm:gap-4 z-10">
            {/* Toy */}
            <div
              onClick={() => {
                sounds.playPounce();
                onObjectClick('toy');
              }}
              className="cursor-pointer group flex flex-col items-center btn-press"
              title="Mainan (Klik untuk bermain)"
            >
              <div className="w-9 h-9 rounded-full bg-[#FAF8F5] dark:bg-[#1E1C1A] border border-[#BDB2A6] dark:border-[#423C36] flex items-center justify-center transition-colors group-hover:border-[var(--accent)]">
                <CircleDot className="w-4 h-4 text-[var(--accent)]" />
              </div>
              <span className="font-mono text-[10px] text-[#756A5E] dark:text-[#B5ACA1] group-hover:text-[#22201D] dark:group-hover:text-[#F6F4EE] transition-colors mt-1.5 uppercase tracking-wider">
                TOY
              </span>
            </div>

            {/* Food Bowl */}
            <div
              onClick={() => {
                sounds.playCrunch();
                onObjectClick('bowl');
              }}
              className="cursor-pointer group flex flex-col items-center btn-press"
              title="Mangkok Pakan (Klik untuk memberi makan)"
            >
              <div className="w-12 sm:w-14 h-7 sm:h-8 rounded-[50%] bg-[#22201D] dark:bg-[#141311] border border-[#141311] dark:border-[#38332E] flex items-center justify-center transition-colors group-hover:border-[var(--accent)]">
                <div className="w-4/5 h-3/5 rounded-[50%] bg-[#5A5046] dark:bg-[#2E2822] flex items-center justify-center font-mono text-[9px] text-[#FAF8F5]">
                  FEED
                </div>
              </div>
              <span className="font-mono text-[10px] text-[#756A5E] dark:text-[#B5ACA1] group-hover:text-[#22201D] dark:group-hover:text-[#F6F4EE] transition-colors mt-1.5 uppercase tracking-wider">
                BOWL
              </span>
            </div>
          </div>

        </div>

        {/* 4. AUTONOMOUS WALKING CAT (Dynamic Positioning Across Room Plane) */}
        <motion.div
          animate={{
            x: waypointCoordinates[currentWaypoint].x,
            y: waypointCoordinates[currentWaypoint].y,
            scaleX: facingDirection,
          }}
          transition={{
            duration: isWalking ? 1.8 : 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 pointer-events-auto"
        >
          <CatCharacter
            customization={customization}
            state={internalState}
            onClick={onCatClick}
            size="lg"
            showShadow={true}
          />
        </motion.div>

        {/* Minimalist Hint Bar */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#FCFBF8]/90 dark:bg-[#181615]/90 px-3 py-1 rounded border border-[#E7E2DA] dark:border-[#2D2A26] flex items-center gap-1.5 font-mono text-[10px] text-[#756A5E] dark:text-[#B5ACA1] pointer-events-none">
          <Info className="w-3 h-3 text-[#9E9284]" />
          <span>KLIK KARAKTER ATAU OBJEK UNTUK BERINTERAKSI // PERILAKU OTONOM AKTIF</span>
        </div>
      </div>
    </div>
  );
};
