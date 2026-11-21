import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PetState, CatCustomization, CatStats, CatPersonality } from '../../types/pet';
import { CatCharacter } from '../cat/CatCharacter';
import { Sun, Moon, CloudSun, Home, Bed, Trees, CircleDot, Info, Sparkles, Utensils, Hand, Footprints } from 'lucide-react';
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

  // Coordinate mappings (pixels offset from center)
  const waypointCoordinates: Record<Waypoint, { x: number; y: number }> = {
    bed: { x: -150, y: 0 },
    window: { x: -85, y: -6 },
    rug: { x: 0, y: 0 },
    front: { x: 0, y: 15 },
    toy: { x: 92, y: 0 },
    bowl: { x: 155, y: 0 },
  };

  const [position, setPosition] = useState<{ x: number; y: number }>(
    isSleeping ? waypointCoordinates.bed : waypointCoordinates.rug
  );
  const [internalState, setInternalState] = useState<PetState>(externalState);
  const [facingDirection, setFacingDirection] = useState<1 | -1>(1); // 1 = right, -1 = left
  const [isWalking, setIsWalking] = useState(false);
  const [walkDuration, setWalkDuration] = useState(1.4);
  const [isDragging, setIsDragging] = useState(false);
  const [clickMarker, setClickMarker] = useState<{ x: number; y: number; key: number } | null>(null);

  const floorRef = useRef<HTMLDivElement>(null);
  const lastExternalStateRef = useRef(externalState);
  const lastManualActionRef = useRef<number>(Date.now());
  const walkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync when sleeping state changes externally
  useEffect(() => {
    if (isSleeping) {
      if (walkTimeoutRef.current) clearTimeout(walkTimeoutRef.current);
      setPosition(waypointCoordinates.bed);
      setIsWalking(false);
      setInternalState('sleeping');
    }
  }, [isSleeping]);

  // Sync when user performs an action externally (feed, play, etc.)
  useEffect(() => {
    if (externalState !== lastExternalStateRef.current) {
      lastExternalStateRef.current = externalState;
      if (externalState === 'eating') {
        walkTo(waypointCoordinates.bowl.x, waypointCoordinates.bowl.y, 'eating');
      } else if (externalState === 'playing') {
        walkTo(waypointCoordinates.toy.x, waypointCoordinates.toy.y, 'playing');
      } else if (externalState === 'sleeping') {
        walkTo(waypointCoordinates.bed.x, waypointCoordinates.bed.y, 'sleeping');
      } else if (externalState === 'affectionate') {
        walkTo(waypointCoordinates.front.x, waypointCoordinates.front.y, 'affectionate');
      } else {
        setInternalState(externalState);
      }
    }
  }, [externalState]);

  // Core Walk Animation Controller
  const walkTo = (
    targetX: number,
    targetY: number,
    arrivalState: PetState = 'idle',
    customDuration?: number
  ) => {
    if (walkTimeoutRef.current) {
      clearTimeout(walkTimeoutRef.current);
    }

    const startX = position.x;
    const startY = position.y;
    const distance = Math.hypot(targetX - startX, targetY - startY);

    // If target is practically where the cat already is
    if (distance < 8) {
      setInternalState(arrivalState);
      return;
    }

    // Set facing direction
    if (targetX > startX + 2) {
      setFacingDirection(1); // Face right
    } else if (targetX < startX - 2) {
      setFacingDirection(-1); // Face left
    }

    const duration = customDuration ?? Math.max(0.7, Math.min(2.2, distance / 95));
    setWalkDuration(duration);
    setIsWalking(true);
    setInternalState('walking');
    setPosition({ x: targetX, y: targetY });

    walkTimeoutRef.current = setTimeout(() => {
      setIsWalking(false);
      setInternalState(arrivalState);
    }, duration * 1000);
  };

  // Autonomous Behavior Loop (Wandering naturally across the room)
  useEffect(() => {
    const autonomousTimer = setInterval(() => {
      // Do not wander if sleeping, walking, dragging, or if user recently moved the cat
      if (isSleeping || isWalking || isDragging) return;
      if (Date.now() - lastManualActionRef.current < 6500) return;

      const currentHunger = stats?.hunger ?? 20;
      const currentEnergy = stats?.energy ?? 80;
      const currentCleanliness = stats?.cleanliness ?? 90;
      const currentAffection = stats?.affection ?? 60;
      const pCode = personality?.code || 'playful';

      // 1. If hungry, walk to the bowl
      if (currentHunger > 65 && Math.abs(position.x - waypointCoordinates.bowl.x) > 30) {
        walkTo(waypointCoordinates.bowl.x, waypointCoordinates.bowl.y, 'curious');
        return;
      }

      // 2. If tired, wander to bed unit
      if (currentEnergy < 25 && Math.abs(position.x - waypointCoordinates.bed.x) > 30) {
        walkTo(waypointCoordinates.bed.x, waypointCoordinates.bed.y, 'sitting');
        return;
      }

      // 3. If cleanliness is low, groom on rug
      if (currentCleanliness < 45 && internalState !== 'grooming') {
        walkTo(waypointCoordinates.rug.x, waypointCoordinates.rug.y, 'grooming');
        return;
      }

      // 4. Personality-driven wandering
      const rand = Math.random();
      if (pCode === 'playful' && rand < 0.45 && Math.abs(position.x - waypointCoordinates.toy.x) > 25) {
        walkTo(waypointCoordinates.toy.x, waypointCoordinates.toy.y, 'playing');
      } else if (pCode === 'lazy' && rand < 0.5) {
        const dest = rand < 0.25 ? waypointCoordinates.bed : waypointCoordinates.rug;
        walkTo(dest.x, dest.y, 'sitting');
      } else if (pCode === 'affectionate' && currentAffection > 50 && rand < 0.4) {
        walkTo(waypointCoordinates.front.x, waypointCoordinates.front.y, 'affectionate');
      } else {
        // Natural lively wandering across diverse spots
        const wanderSpots = [
          { ...waypointCoordinates.rug, state: rand < 0.3 ? 'sitting' : 'happy' },
          { ...waypointCoordinates.window, state: 'curious' },
          { ...waypointCoordinates.toy, state: 'curious' },
          { x: -65, y: 8, state: 'sitting' },
          { x: 65, y: 10, state: 'curious' },
          { ...waypointCoordinates.front, state: 'sitting' },
        ];

        // Filter out spots that are very close to current position
        const filtered = wanderSpots.filter(
          (s) => Math.hypot(s.x - position.x, s.y - position.y) > 40
        );

        if (filtered.length > 0) {
          const nextTarget = filtered[Math.floor(Math.random() * filtered.length)];
          walkTo(nextTarget.x, nextTarget.y, nextTarget.state as PetState);
        }
      }
    }, 5500 + Math.random() * 3500);

    return () => clearInterval(autonomousTimer);
  }, [position, isSleeping, isWalking, isDragging, internalState, stats, personality]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (walkTimeoutRef.current) clearTimeout(walkTimeoutRef.current);
    };
  }, []);

  // Handle floor clicks to move the cat manually
  const handleFloorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    // Don't trigger if clicked on an interactive control
    if (target.closest('button, [data-interactive="true"], .cat-character-container')) {
      return;
    }

    if (!floorRef.current) return;
    const rect = floorRef.current.getBoundingClientRect();

    // Horizontal offset relative to center of room
    const clickX = e.clientX - (rect.left + rect.width / 2);
    const clampedX = Math.max(-165, Math.min(165, Math.round(clickX)));

    // Vertical offset within floor (-15 to 20)
    const clickY = e.clientY - rect.top;
    const clampedY = Math.max(-15, Math.min(20, Math.round(((clickY - 70) / 90) * 35)));

    // Set beacon marker
    setClickMarker({ x: clampedX, y: clampedY, key: Date.now() });
    sounds.playClick();

    // Order cat to walk to clicked location
    lastManualActionRef.current = Date.now();
    walkTo(clampedX, clampedY, 'curious');
  };

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
      <div className="relative w-full h-[360px] sm:h-[400px] rounded-lg overflow-hidden border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#F4F0E8] dark:bg-[#1A1816] flex flex-col justify-between select-none">
        
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

        {/* Floor Transition & Clean Interactive Planks */}
        <div
          ref={floorRef}
          onClick={handleFloorClick}
          className="absolute bottom-0 left-0 right-0 h-40 bg-[#E8DFCFC0] dark:bg-[#201D1A] border-t border-[#D5CDC2] dark:border-[#38332E] cursor-pointer"
          title="Klik lantai untuk memanggil kucing ke lokasi ini"
        >
          <div className="w-full h-full opacity-15 bg-[linear-gradient(90deg,transparent_49%,rgba(34,32,29,0.3)_50%,transparent_51%)] dark:bg-[linear-gradient(90deg,transparent_49%,rgba(255,255,255,0.15)_50%,transparent_51%)] bg-[length:100px_100%] pointer-events-none" />
        </div>

        {/* Dynamic Floor Click Ripple / Target Marker */}
        <AnimatePresence>
          {clickMarker && (
            <motion.div
              key={clickMarker.key}
              initial={{ scale: 0.2, opacity: 0.9 }}
              animate={{ scale: 1.25, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.75, ease: 'easeOut' }}
              style={{
                left: `calc(50% + ${clickMarker.x}px)`,
                bottom: `${22 + clickMarker.y}px`,
              }}
              className="absolute -translate-x-1/2 pointer-events-none z-15 flex flex-col items-center"
            >
              <div className="w-7 h-7 rounded-full border-2 border-[var(--accent)] bg-[var(--accent)]/20 flex items-center justify-center">
                <Footprints className="w-3.5 h-3.5 text-[var(--accent)]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive Floor Objects & Center Rug */}
        <div className="relative w-full h-full flex items-end justify-between px-4 sm:px-10 pb-4 z-10 pointer-events-none">

          {/* 1. Bed Unit (Left) */}
          <div
            data-interactive="true"
            onClick={() => {
              sounds.playClick();
              lastManualActionRef.current = Date.now();
              walkTo(waypointCoordinates.bed.x, waypointCoordinates.bed.y, isSleeping ? 'idle' : 'sleeping');
              onObjectClick('bed');
            }}
            className="pointer-events-auto cursor-pointer group flex flex-col items-center btn-press z-10"
            title="Tempat Tidur (Klik untuk memanggil kucing / tidur)"
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

          {/* 2. Center Area: Floor Rug (Cleanly Unobstructed, Clickable) */}
          <div
            data-interactive="true"
            onClick={(e) => {
              e.stopPropagation();
              sounds.playPurr();
              lastManualActionRef.current = Date.now();
              walkTo(waypointCoordinates.rug.x, waypointCoordinates.rug.y, 'sitting');
            }}
            className="pointer-events-auto relative flex flex-col items-center justify-end -mb-1 cursor-pointer group z-10"
            title="Karpet Santai (Klik untuk memanggil kucing ke karpet)"
          >
            <div className="w-48 sm:w-64 h-16 sm:h-20 rounded-[50%] bg-[#EAE2D5] dark:bg-[#262320] border border-[#D0C6B8] dark:border-[#3E3832] transition-colors group-hover:border-[var(--accent)] flex items-center justify-center">
              <div className="w-[88%] h-[78%] rounded-[50%] border border-dashed border-[#D5CDC2] dark:border-[#38332E] opacity-60" />
            </div>
            <span className="font-mono text-[9px] text-[#8E8376] dark:text-[#7E756B] group-hover:text-[#22201D] dark:group-hover:text-[#F6F4EE] transition-colors mt-1 uppercase tracking-wider">
              RUG AREA
            </span>
          </div>

          {/* 3. Right Side: Food Bowl + Toy */}
          <div className="flex items-end gap-3 sm:gap-4 z-10">
            {/* Toy */}
            <div
              data-interactive="true"
              onClick={() => {
                sounds.playPounce();
                lastManualActionRef.current = Date.now();
                walkTo(waypointCoordinates.toy.x, waypointCoordinates.toy.y, 'playing');
                onObjectClick('toy');
              }}
              className="pointer-events-auto cursor-pointer group flex flex-col items-center btn-press"
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
              data-interactive="true"
              onClick={() => {
                sounds.playCrunch();
                lastManualActionRef.current = Date.now();
                walkTo(waypointCoordinates.bowl.x, waypointCoordinates.bowl.y, 'eating');
                onObjectClick('bowl');
              }}
              className="pointer-events-auto cursor-pointer group flex flex-col items-center btn-press"
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

        {/* 4. AUTONOMOUS & DRAGGABLE CAT CHARACTER */}
        <motion.div
          drag={!isSleeping}
          dragConstraints={{ left: -165, right: 165, top: -18, bottom: 22 }}
          dragElastic={0.12}
          dragMomentum={false}
          whileDrag={{ scale: 1.08, zIndex: 40 }}
          animate={
            isDragging
              ? undefined
              : {
                  x: position.x,
                  y: position.y,
                  scaleX: facingDirection,
                }
          }
          transition={{
            duration: isWalking ? walkDuration : 0.35,
            ease: [0.22, 1, 0.36, 1],
          }}
          onDragStart={() => {
            setIsDragging(true);
            setIsWalking(false);
            if (walkTimeoutRef.current) clearTimeout(walkTimeoutRef.current);
            setInternalState('curious');
            sounds.playPurr();
            lastManualActionRef.current = Date.now();
          }}
          onDragEnd={(_e, info) => {
            setIsDragging(false);

            // If drag movement is tiny, treat as a click/pet action
            const dragDist = Math.hypot(info.offset.x, info.offset.y);
            if (dragDist < 6) {
              onCatClick();
              return;
            }

            const newX = Math.max(-165, Math.min(165, Math.round(position.x + info.offset.x)));
            const newY = Math.max(-15, Math.min(20, Math.round(position.y + info.offset.y)));

            if (newX > position.x) setFacingDirection(1);
            else if (newX < position.x) setFacingDirection(-1);

            setPosition({ x: newX, y: newY });
            lastManualActionRef.current = Date.now();
            sounds.playPounce();

            // Contextual reaction based on drop location
            if (Math.abs(newX - waypointCoordinates.bed.x) < 35) {
              setInternalState('sitting');
            } else if (Math.abs(newX - waypointCoordinates.bowl.x) < 35) {
              setInternalState('curious');
            } else if (Math.abs(newX - waypointCoordinates.toy.x) < 35) {
              setInternalState('playing');
            } else {
              setInternalState('happy');
              setTimeout(() => {
                setInternalState((prev) => (prev === 'happy' ? 'sitting' : prev));
              }, 1400);
            }
          }}
          className={`absolute bottom-5 left-1/2 -translate-x-1/2 z-20 cat-character-container pointer-events-auto select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          title="Tarik (drag) untuk memindahkan, atau klik untuk mengelus"
        >
          <CatCharacter
            customization={customization}
            state={internalState}
            onClick={() => {
              if (!isDragging) onCatClick();
            }}
            size="lg"
            showShadow={true}
          />
        </motion.div>

      </div>

      {/* Control Guidance & Telemetry Footer Bar - Safely Below Room Canvas (Zero Overlap with Rug) */}
      <div className="mt-3.5 pt-3 border-t border-[#E7E2DA] dark:border-[#2D2A26] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 font-mono text-xs text-[#756A5E] dark:text-[#B5ACA1]">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#F4F0E8] dark:bg-[#1E1C1A] border border-[#E7E2DA] dark:border-[#2D2A26] text-[#22201D] dark:text-[#F6F4EE] font-semibold text-[10px]">
            <Hand className="w-3 h-3 text-[var(--accent)]" />
            <span>KONTROL INTERAKTIF</span>
          </div>
          <span className="text-[11px]">
            Klik lantai untuk memanggil • Tarik (drag) karakter untuk memindahkan • Perilaku otonom aktif
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-[#9E9284] dark:text-[#7E756B] self-end sm:self-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>OTONOM BERJALAN</span>
        </div>
      </div>

    </div>
  );
};
