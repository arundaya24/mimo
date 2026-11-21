import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PetState, CatCustomization, CatStats, CatPersonality } from '../../types/pet';
import { CatCharacter } from '../cat/CatCharacter';
import {
  Sun,
  Moon,
  CloudSun,
  Home,
  Bed,
  Trees,
  CircleDot,
  Info,
  Sparkles,
  Utensils,
  Hand,
  Footprints,
  Sprout,
  Droplets,
  Lightbulb,
  Fish,
  Layers,
} from 'lucide-react';
import { sounds } from '../../audio/soundSynth';
import { themeManager } from '../../services/themeManager';

interface RoomEnvironmentProps {
  customization: CatCustomization;
  state: PetState;
  catName: string;
  isSleeping: boolean;
  gender?: string;
  stats?: CatStats;
  personality?: CatPersonality;
  onCatClick: () => void;
  onObjectClick: (objectType: string) => void;
  currentRoom?: string;
  onRoomChange?: (room: string) => void;
}

export const RoomEnvironment: React.FC<RoomEnvironmentProps> = ({
  customization,
  state: externalState,
  catName,
  isSleeping,
  gender = 'female',
  stats,
  personality,
  onCatClick,
  onObjectClick,
  currentRoom = 'living_room',
  onRoomChange,
}) => {
  // Active Theme & Room Lighting Synchronization
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => themeManager.isDark());
  const [manualLighting, setManualLighting] = useState<'day' | 'night' | null>(null);

  // Subscribe to global theme changes so light mode immediately illuminates room
  useEffect(() => {
    setIsDarkMode(themeManager.isDark());
    const unsub = themeManager.subscribe((_settings, isDark) => {
      setIsDarkMode(isDark);
      setManualLighting(null); // Reset manual override whenever global theme changes
    });
    return unsub;
  }, []);

  // In Light Mode (!isDarkMode), room defaults strictly to daytime bright daylight;
  // In Dark Mode (isDarkMode), room defaults to cozy night mode.
  // User can also toggle via the header daylight badge anytime.
  const isDay = manualLighting !== null ? manualLighting === 'day' : !isDarkMode;
  const timeOfDay: 'day' | 'night' = isDay ? 'day' : 'night';

  // Room Waypoints (Pixels offset from center for each room)
  const roomWaypoints: Record<string, Record<string, { x: number; y: number }>> = {
    living_room: {
      scratch: { x: -180, y: 0 },
      rug: { x: 0, y: 0 },
      front: { x: 0, y: 16 },
      toy: { x: 120, y: 0 },
      bowl: { x: 195, y: 0 },
    },
    balcony: {
      grass: { x: -180, y: 0 },
      deck: { x: 0, y: 4 },
      front: { x: 0, y: 16 },
      butterfly: { x: 130, y: -6 },
      rail: { x: 190, y: -4 },
    },
    bedroom: {
      bed: { x: -180, y: 0 },
      rug: { x: 0, y: 0 },
      front: { x: 0, y: 16 },
      lamp: { x: 130, y: 0 },
      nightstand: { x: 190, y: 0 },
    },
    kitchen: {
      fountain: { x: -180, y: 0 },
      mat: { x: 0, y: 0 },
      front: { x: 0, y: 16 },
      treats: { x: 130, y: 0 },
      counter: { x: 195, y: 0 },
    },
  };

  const currentRoomPoints = roomWaypoints[currentRoom] || roomWaypoints.living_room;

  const [position, setPosition] = useState<{ x: number; y: number }>(
    isSleeping ? (currentRoomPoints.bed || { x: -180, y: 0 }) : { x: 0, y: 0 }
  );
  const [internalState, setInternalState] = useState<PetState>(externalState);
  const [facingDirection, setFacingDirection] = useState<1 | -1>(1);
  const [isWalking, setIsWalking] = useState(false);
  const [walkDuration, setWalkDuration] = useState(1.4);
  const [isDragging, setIsDragging] = useState(false);
  const [clickMarker, setClickMarker] = useState<{ x: number; y: number; key: number } | null>(null);
  const [bedroomLampOn, setBedroomLampOn] = useState(true);

  const floorRef = useRef<HTMLDivElement>(null);
  const lastExternalStateRef = useRef(externalState);
  const lastManualActionRef = useRef<number>(Date.now());
  const walkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync sleeping state
  useEffect(() => {
    if (isSleeping) {
      if (walkTimeoutRef.current) clearTimeout(walkTimeoutRef.current);
      const sleepPos = currentRoomPoints.bed || { x: -180, y: 0 };
      setPosition(sleepPos);
      setIsWalking(false);
      setInternalState('sleeping');
    }
  }, [isSleeping, currentRoom]);

  // Sync external state changes
  useEffect(() => {
    if (externalState !== lastExternalStateRef.current) {
      lastExternalStateRef.current = externalState;
      if (externalState === 'eating') {
        const dest = currentRoomPoints.bowl || currentRoomPoints.treats || { x: 180, y: 0 };
        walkTo(dest.x, dest.y, 'eating');
      } else if (externalState === 'playing') {
        const dest = currentRoomPoints.toy || currentRoomPoints.butterfly || { x: 120, y: 0 };
        walkTo(dest.x, dest.y, 'playing');
      } else if (externalState === 'sleeping') {
        const dest = currentRoomPoints.bed || { x: -180, y: 0 };
        walkTo(dest.x, dest.y, 'sleeping');
      } else if (externalState === 'affectionate') {
        walkTo(0, 16, 'affectionate');
      } else {
        setInternalState(externalState);
      }
    }
  }, [externalState, currentRoom]);

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

    if (distance < 8) {
      setInternalState(arrivalState);
      return;
    }

    if (targetX > startX + 2) {
      setFacingDirection(1);
    } else if (targetX < startX - 2) {
      setFacingDirection(-1);
    }

    const duration = customDuration ?? Math.max(0.8, Math.min(2.5, distance / 110));
    setWalkDuration(duration);
    setIsWalking(true);
    setInternalState('walking');
    setPosition({ x: targetX, y: targetY });

    walkTimeoutRef.current = setTimeout(() => {
      setIsWalking(false);
      setInternalState(arrivalState);
      if (arrivalState !== 'idle' && arrivalState !== 'sitting' && arrivalState !== 'sleeping') {
        sounds.playEmotionalMeow(arrivalState, gender);
      }
    }, duration * 1000);
  };

  // Autonomous Roaming Loop across expansive floor
  useEffect(() => {
    const autonomousTimer = setInterval(() => {
      if (isSleeping || isWalking || isDragging) return;
      if (Date.now() - lastManualActionRef.current < 6500) return;

      const currentHunger = stats?.hunger ?? 20;
      const currentEnergy = stats?.energy ?? 80;
      const currentCleanliness = stats?.cleanliness ?? 90;
      const currentAffection = stats?.affection ?? 60;
      const pCode = personality?.code || 'playful';

      // Hunger instinct
      if (currentHunger > 65) {
        if (currentRoom === 'kitchen' && currentRoomPoints.treats) {
          walkTo(currentRoomPoints.treats.x, currentRoomPoints.treats.y, 'curious');
          return;
        } else if (currentRoomPoints.bowl) {
          walkTo(currentRoomPoints.bowl.x, currentRoomPoints.bowl.y, 'curious');
          return;
        }
      }

      // Energy / tired instinct
      if (currentEnergy < 25 && currentRoom === 'bedroom' && currentRoomPoints.bed) {
        walkTo(currentRoomPoints.bed.x, currentRoomPoints.bed.y, 'sitting');
        return;
      }

      // Grooming instinct
      if (currentCleanliness < 45 && internalState !== 'grooming') {
        walkTo(0, 0, 'grooming');
        return;
      }

      // Personality & Room-Specific Autonomous Roaming
      const rand = Math.random();
      if (currentRoom === 'balcony') {
        if (rand < 0.35 && currentRoomPoints.butterfly) {
          walkTo(currentRoomPoints.butterfly.x, currentRoomPoints.butterfly.y, 'playing');
        } else if (rand < 0.65 && currentRoomPoints.grass) {
          walkTo(currentRoomPoints.grass.x, currentRoomPoints.grass.y, 'eating');
        } else {
          walkTo(rand < 0.5 ? -70 : 80, 4, rand < 0.5 ? 'sitting' : 'happy');
        }
      } else if (currentRoom === 'bedroom') {
        if (rand < 0.4 && currentRoomPoints.bed) {
          walkTo(currentRoomPoints.bed.x, currentRoomPoints.bed.y, 'sitting');
        } else if (rand < 0.7) {
          walkTo(0, 0, 'sitting');
        } else {
          walkTo(70, 8, 'curious');
        }
      } else if (currentRoom === 'kitchen') {
        if (rand < 0.35 && currentRoomPoints.fountain) {
          walkTo(currentRoomPoints.fountain.x, currentRoomPoints.fountain.y, 'curious');
        } else if (rand < 0.65 && currentRoomPoints.treats) {
          walkTo(currentRoomPoints.treats.x, currentRoomPoints.treats.y, 'curious');
        } else {
          walkTo(rand < 0.5 ? -60 : 70, 6, 'sitting');
        }
      } else {
        // Living room default
        if (pCode === 'playful' && rand < 0.45 && currentRoomPoints.toy) {
          walkTo(currentRoomPoints.toy.x, currentRoomPoints.toy.y, 'playing');
        } else if (rand < 0.35 && currentRoomPoints.scratch) {
          walkTo(currentRoomPoints.scratch.x, currentRoomPoints.scratch.y, 'playing');
        } else if (pCode === 'affectionate' && currentAffection > 50 && rand < 0.35) {
          walkTo(0, 16, 'affectionate');
        } else {
          const wanderX = Math.round((Math.random() - 0.5) * 320);
          const wanderY = Math.round(Math.random() * 20 - 6);
          walkTo(wanderX, wanderY, rand < 0.3 ? 'sitting' : rand < 0.6 ? 'curious' : 'idle');
        }
      }
    }, 5500 + Math.random() * 3500);

    return () => clearInterval(autonomousTimer);
  }, [position, isSleeping, isWalking, isDragging, internalState, stats, personality, currentRoom]);

  // Clean up timer
  useEffect(() => {
    return () => {
      if (walkTimeoutRef.current) clearTimeout(walkTimeoutRef.current);
    };
  }, []);

  // Floor click to call cat
  const handleFloorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, [data-interactive="true"], .cat-character-container')) {
      return;
    }

    if (!floorRef.current) return;
    const rect = floorRef.current.getBoundingClientRect();

    const clickX = e.clientX - (rect.left + rect.width / 2);
    const clampedX = Math.max(-210, Math.min(210, Math.round(clickX)));

    const clickY = e.clientY - rect.top;
    const clampedY = Math.max(-20, Math.min(25, Math.round(((clickY - 80) / 100) * 40)));

    setClickMarker({ x: clampedX, y: clampedY, key: Date.now() });
    sounds.playClick();
    setTimeout(() => sounds.playEmotionalMeow('curious', gender), 90);

    lastManualActionRef.current = Date.now();
    walkTo(clampedX, clampedY, 'curious');
  };

  const rooms = [
    { id: 'living_room', label: 'LIVING ROOM', code: 'RM-01', desc: 'Garukan & Makan', icon: Home },
    { id: 'balcony', label: 'SUNNY BALCONY', code: 'RM-02', desc: 'Rumput & Kupu-kupu', icon: Trees },
    { id: 'bedroom', label: 'COZY BEDROOM', code: 'RM-03', desc: 'Tidur Nyenyak 1.5x', icon: Bed },
    { id: 'kitchen', label: 'PANTRY KITCHEN', code: 'RM-04', desc: 'Air Mancur & Salmon', icon: Utensils },
  ];

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-xl border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#181615] p-4 sm:p-6 transition-colors duration-200 text-left">
      
      {/* Top Header Bar: Room Switcher, Gender Badge, & Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4 z-20 relative">
        <div className="flex items-center gap-1.5 p-1 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#F8F6F1] dark:bg-[#1E1C1A] overflow-x-auto max-w-full">
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
                className={`btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-[11px] font-medium whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-[#FCFBF8] dark:bg-[#181615] text-[#22201D] dark:text-[#F6F4EE] border border-[#E7E2DA] dark:border-[#2D2A26] font-semibold'
                    : 'text-[#756A5E] dark:text-[#B5ACA1] hover:text-[#22201D] dark:hover:text-[#F6F4EE]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>{room.label}</span>
              </button>
            );
          })}
        </div>

        {/* Ambient & Gender Badge Indicator */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          {/* Gender Indicator Badge */}
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md border font-semibold ${
              gender === 'male'
                ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
            }`}
          >
            <span>{gender === 'male' ? '♂ JANTAN' : '♀ BETINA'}</span>
          </div>

          {/* Daylight / Night Mode Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              setManualLighting(isDay ? 'night' : 'day');
            }}
            title="Klik untuk mengubah pencahayaan ruangan antara Siang dan Malam"
            className="btn-press flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#181615] hover:border-[var(--accent)] transition-colors cursor-pointer select-none"
          >
            {isDay ? (
              <>
                <Sun className="w-3.5 h-3.5 text-[#B88728]" />
                <span className="hidden sm:inline font-mono text-[10px] font-semibold text-[#8F681A] dark:text-[#E5B558]">DAYLIGHT</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline font-mono text-[10px] font-semibold text-indigo-500 dark:text-indigo-300">NIGHT</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Expansive Room Canvas (Height 480px sm:540px md:580px) */}
      <div className="relative w-full h-[460px] sm:h-[520px] md:h-[560px] rounded-lg overflow-hidden border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#F4F0E8] dark:bg-[#1A1816] flex flex-col justify-between select-none">
        
        {/* ================= BACKGROUND SCENERY LAYERS (PER ROOM) ================= */}
        
        {/* ROOM 1: LIVING ROOM */}
        {currentRoom === 'living_room' && (
          <div className="absolute inset-0 flex justify-between p-6 pointer-events-none">
            {/* Picture Window */}
            <div className="relative w-36 sm:w-44 h-44 sm:h-52 rounded-t-lg border border-[#D5CDC2] dark:border-[#38332E] bg-[#FAF8F5] dark:bg-[#1E1C1A] overflow-hidden">
              <div className={`w-full h-full relative flex items-center justify-center transition-colors duration-300 ${
                isDay
                  ? 'bg-gradient-to-b from-[#CFE4EE] via-[#DCEBF5] to-[#E9DFCE]'
                  : 'bg-gradient-to-b from-[#151D2A] via-[#1E2638] to-[#1C1E2B]'
              }`}>
                {isDay ? (
                  <div className="w-9 h-9 rounded-full bg-[#E5B558] opacity-90 shadow-sm" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#EAE5D9] shadow-sm relative">
                    <div className="absolute top-1 left-2 w-1 h-1 rounded-full bg-white opacity-80" />
                  </div>
                )}
                <div className="absolute inset-0 border-r border-[#FAF8F5]/70 dark:border-white/20 left-1/2" />
                <div className="absolute inset-0 border-b border-[#FAF8F5]/70 dark:border-white/20 top-1/2" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#D5CDC2] dark:bg-[#38332E]" />
            </div>

            {/* Spec Art Frame */}
            <div className="hidden sm:block p-2 bg-[#FAF8F5] dark:bg-[#1E1C1A] border border-[#D5CDC2] dark:border-[#38332E] rounded w-24 h-28">
              <div className="w-full h-16 bg-[#E7E2DA] dark:bg-[#282420] rounded flex items-center justify-center font-mono text-[9px] text-[#756A5E] dark:text-[#B5ACA1]">
                SPEC
              </div>
              <div className="font-mono text-[9px] text-center text-[#756A5E] dark:text-[#B5ACA1] mt-1.5 uppercase tracking-wider">
                {catName}
              </div>
            </div>

            {/* Hanging Bookshelf */}
            <div className="relative w-40 h-2.5 bg-[#D5CDC2] dark:bg-[#38332E] rounded-xs top-8">
              <div className="absolute -top-5 left-3 flex gap-1 items-end">
                <div className="w-2.5 h-5 bg-[#C75D35] rounded-2xs" />
                <div className="w-2.5 h-6 bg-[#4A7C59] rounded-2xs" />
                <div className="w-2.5 h-4 bg-[#756A5E] rounded-2xs" />
              </div>
            </div>
          </div>
        )}

        {/* ROOM 2: SUNNY BALCONY & GARDEN */}
        {currentRoom === 'balcony' && (
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {/* Open Sky Panorama */}
            <div className={`w-full h-64 relative overflow-hidden transition-colors duration-300 ${
              isDay
                ? 'bg-gradient-to-b from-[#99CEFF] via-[#CFE6FD] to-[#EBF5FE]'
                : 'bg-gradient-to-b from-[#15233A] via-[#1D2E49] to-[#172233]'
            }`}>
              {isDay ? (
                <>
                  <div className="absolute top-8 right-16 w-14 h-14 rounded-full bg-[#FCE38A] opacity-95 blur-xs shadow-md" />
                  <div className="absolute top-16 left-12 w-28 h-8 rounded-full bg-white/80 blur-xs" />
                  <div className="absolute top-24 right-48 w-36 h-9 rounded-full bg-white/70 blur-xs" />
                </>
              ) : (
                <>
                  <div className="absolute top-8 right-16 w-12 h-12 rounded-full bg-[#EDE8DC] opacity-90 shadow-sm" />
                  <div className="absolute top-14 left-16 w-1 h-1 rounded-full bg-white opacity-80" />
                  <div className="absolute top-20 right-40 w-1.5 h-1.5 rounded-full bg-white opacity-70" />
                  <div className="absolute top-24 left-36 w-1 h-1 rounded-full bg-white opacity-60" />
                </>
              )}
              {/* Balcony Railing Bars */}
              <div className="absolute bottom-0 left-0 right-0 h-16 border-t-2 border-[#A8B7C7] dark:border-[#384656] flex justify-around">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div key={i} className="w-0.5 h-full bg-[#A8B7C7] dark:bg-[#384656]" />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ROOM 3: COZY BEDROOM */}
        {currentRoom === 'bedroom' && (
          <div className="absolute inset-0 flex justify-between p-6 pointer-events-none">
            {/* Arched Window (Daylight / Moonlit) */}
            <div className="relative w-32 sm:w-40 h-48 sm:h-56 rounded-t-full border border-[#C5BDB2] dark:border-[#38332E] bg-[#FAF8F5] dark:bg-[#1E1C1A] overflow-hidden">
              <div className={`w-full h-full relative flex items-center justify-center transition-colors duration-300 ${
                isDay
                  ? 'bg-gradient-to-b from-[#87CEEB] via-[#BFE3F7] to-[#E8F1F5]'
                  : 'bg-gradient-to-b from-[#192233] via-[#2A3448] to-[#252836]'
              }`}>
                {isDay ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-[#FFD166] opacity-95 shadow-md" />
                    <div className="absolute top-6 left-4 w-12 h-4 rounded-full bg-white/70 blur-2xs" />
                    <div className="absolute bottom-16 right-4 w-14 h-5 rounded-full bg-white/60 blur-2xs" />
                  </>
                ) : (
                  <>
                    <div className="w-6 h-6 rounded-full bg-[#EAE5D9] shadow-sm" />
                    <div className="absolute top-4 left-6 w-1 h-1 rounded-full bg-white opacity-80" />
                    <div className="absolute top-12 right-6 w-1.5 h-1.5 rounded-full bg-white opacity-70" />
                    <div className="absolute bottom-16 left-8 w-1 h-1 rounded-full bg-white opacity-80" />
                  </>
                )}
              </div>
            </div>

            {/* Bedroom Ambient Lamp Glow Effect */}
            {bedroomLampOn && (
              <div className={`absolute top-16 right-20 w-48 h-48 rounded-full blur-2xl pointer-events-none ${
                isDay ? 'bg-[#FFDF9E]/25' : 'bg-[#FFD77A]/15'
              }`} />
            )}

            {/* Wall Dream Frame */}
            <div className="hidden sm:block p-2 bg-[#FAF8F5] dark:bg-[#1E1C1A] border border-[#C5BDB2] dark:border-[#38332E] rounded w-24 h-28">
              <div className="w-full h-16 bg-[#D8CEBF] dark:bg-[#282420] rounded flex items-center justify-center font-mono text-[9px] text-[#756A5E] dark:text-[#B5ACA1]">
                DREAM
              </div>
              <div className="font-mono text-[9px] text-center text-[#756A5E] dark:text-[#B5ACA1] mt-1.5 uppercase">
                SLEEP WELL
              </div>
            </div>
          </div>
        )}

        {/* ROOM 4: KITCHEN & PANTRY */}
        {currentRoom === 'kitchen' && (
          <div className="absolute inset-0 flex justify-between p-6 pointer-events-none">
            {/* Subway Tiles Pattern & Stainless Backsplash */}
            <div className="absolute top-0 left-0 right-0 h-44 opacity-25 bg-[linear-gradient(90deg,transparent_48%,rgba(0,0,0,0.12)_50%,transparent_52%),linear-gradient(0deg,transparent_48%,rgba(0,0,0,0.12)_50%,transparent_52%)] dark:bg-[linear-gradient(90deg,transparent_48%,rgba(255,255,255,0.08)_50%,transparent_52%),linear-gradient(0deg,transparent_48%,rgba(255,255,255,0.08)_50%,transparent_52%)] bg-[length:40px_20px]" />
            
            {/* Hanging Copper Pans */}
            <div className="relative w-48 h-2 bg-[#BDB2A6] dark:bg-[#3A332B] rounded-xs top-8 flex justify-around px-2">
              <div className="w-6 h-10 border-b-2 border-l-2 border-[#D97746] rounded-b-full -top-1 relative" />
              <div className="w-8 h-12 border-b-2 border-l-2 border-[#B88728] rounded-b-full -top-1 relative" />
              <div className="w-5 h-9 border-b-2 border-l-2 border-[#756A5E] rounded-b-full -top-1 relative" />
            </div>

            {/* Pantry Menu Board */}
            <div className="hidden sm:block p-2.5 bg-[#FAF6EE] dark:bg-[#141311] border border-[#D5CDC2] dark:border-[#3D3833] rounded w-28 h-32 text-center font-mono">
              <span className="text-[9px] text-[var(--accent)] font-semibold block border-b border-[#D5CDC2] dark:border-[#3D3833] pb-1">
                PANTRY MENU
              </span>
              <span className="text-[8px] text-[#5A5046] dark:text-[#A89F91] block mt-2">1. Fresh Salmon</span>
              <span className="text-[8px] text-[#5A5046] dark:text-[#A89F91] block mt-1">2. Cat Spring Water</span>
              <span className="text-[8px] text-[#5A5046] dark:text-[#A89F91] block mt-1">3. Crunchy Kibble</span>
            </div>
          </div>
        )}

        {/* ================= EXPANSIVE FLOOR PLANE (DEEP 200px+) ================= */}
        <div
          ref={floorRef}
          onClick={handleFloorClick}
          className="absolute bottom-0 left-0 right-0 h-52 sm:h-60 border-t border-[#D5CDC2] dark:border-[#38332E] cursor-pointer"
          title="Klik lantai untuk memanggil kucing ke lokasi ini"
        >
          {/* Floor Texture per Room */}
          {currentRoom === 'living_room' && (
            <div className="w-full h-full bg-[#EADECB] dark:bg-[#201D1A]">
              <div className="w-full h-full opacity-15 bg-[linear-gradient(90deg,transparent_49%,rgba(34,32,29,0.3)_50%,transparent_51%)] dark:bg-[linear-gradient(90deg,transparent_49%,rgba(255,255,255,0.15)_50%,transparent_51%)] bg-[length:120px_100%]" />
            </div>
          )}

          {currentRoom === 'balcony' && (
            <div className="w-full h-full bg-[#DBCBB5] dark:bg-[#241D17]">
              {/* Teak Deck Slats */}
              <div className="w-full h-full opacity-20 bg-[linear-gradient(90deg,transparent_47%,rgba(34,32,29,0.5)_50%,transparent_53%)] bg-[length:48px_100%]" />
            </div>
          )}

          {currentRoom === 'bedroom' && (
            <div className="w-full h-full bg-[#E4DACD] dark:bg-[#1E1B19]">
              {/* Soft Carpet Grain */}
              <div className="w-full h-full opacity-15 bg-[radial-gradient(rgba(0,0,0,0.3)_1px,transparent_1px)] bg-[size:8px_8px]" />
            </div>
          )}

          {currentRoom === 'kitchen' && (
            <div className="w-full h-full bg-[#EAE5DC] dark:bg-[#1C1A18]">
              {/* Checkered Ceramic Tiles */}
              <div className="w-full h-full opacity-15 bg-[linear-gradient(45deg,#222_25%,transparent_25%),linear-gradient(-45deg,#222_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#222_75%),linear-gradient(-45deg,transparent_75%,#222_75%)] bg-[size:40px_40px]" />
            </div>
          )}
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
                bottom: `${26 + clickMarker.y}px`,
              }}
              className="absolute -translate-x-1/2 pointer-events-none z-15 flex flex-col items-center"
            >
              <div className="w-7 h-7 rounded-full border-2 border-[var(--accent)] bg-[var(--accent)]/20 flex items-center justify-center">
                <Footprints className="w-3.5 h-3.5 text-[var(--accent)]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================= INTERACTIVE ROOM STATIONS (PER ROOM) ================= */}
        <div className="relative w-full h-full flex items-end justify-between px-6 sm:px-12 pb-5 z-10 pointer-events-none">

          {/* ROOM 1: LIVING ROOM STATIONS */}
          {currentRoom === 'living_room' && (
            <>
              {/* Scratching Tree (Left) */}
              <div
                data-interactive="true"
                onClick={() => {
                  sounds.playScratch();
                  lastManualActionRef.current = Date.now();
                  walkTo(currentRoomPoints.scratch.x, currentRoomPoints.scratch.y, 'playing');
                  onObjectClick('scratch_tree');
                }}
                className="pointer-events-auto cursor-pointer group flex flex-col items-center btn-press z-10"
                title="Pohon Garukan (Klik untuk mencakar tiang rami / hilangkan bosan)"
              >
                <div className="relative w-20 sm:w-24 h-16 sm:h-20 rounded-t-lg bg-[#DACDBE] dark:bg-[#2A2622] border border-[#BDB2A6] dark:border-[#423C36] flex flex-col items-center justify-between p-1.5 transition-colors group-hover:border-[var(--accent)]">
                  <div className="w-12 h-3 rounded-full bg-[#C75D35] flex items-center justify-center">
                    <span className="font-mono text-[8px] text-white font-bold">PERCH</span>
                  </div>
                  <div className="w-5 h-8 bg-[#C8B8A6] dark:bg-[#38312A] border-x border-dashed border-[#8E7F70] flex items-center justify-center">
                    <Layers className="w-3 h-3 text-[#756A5E] dark:text-[#B5ACA1]" />
                  </div>
                </div>
                <span className="font-mono text-[10px] text-[#756A5E] dark:text-[#B5ACA1] group-hover:text-[#22201D] dark:group-hover:text-[#F6F4EE] transition-colors mt-1 uppercase tracking-wider">
                  SCRATCH TREE
                </span>
              </div>

              {/* Floor Rug (Center) */}
              <div
                data-interactive="true"
                onClick={(e) => {
                  e.stopPropagation();
                  sounds.playPurr();
                  lastManualActionRef.current = Date.now();
                  walkTo(0, 0, 'sitting');
                }}
                className="pointer-events-auto relative flex flex-col items-center justify-end -mb-1 cursor-pointer group z-10"
                title="Karpet Santai (Klik untuk memanggil kucing ke karpet)"
              >
                <div className="w-56 sm:w-72 h-18 sm:h-22 rounded-[50%] bg-[#EAE2D5] dark:bg-[#262320] border border-[#D0C6B8] dark:border-[#3E3832] transition-colors group-hover:border-[var(--accent)] flex items-center justify-center">
                  <div className="w-[88%] h-[78%] rounded-[50%] border border-dashed border-[#D5CDC2] dark:border-[#38332E] opacity-60" />
                </div>
                <span className="font-mono text-[9px] text-[#8E8376] dark:text-[#7E756B] group-hover:text-[#22201D] dark:group-hover:text-[#F6F4EE] transition-colors mt-1 uppercase tracking-wider">
                  LIVING RUG
                </span>
              </div>

              {/* Toy & Food Bowl (Right) */}
              <div className="flex items-end gap-3 sm:gap-4 z-10">
                <div
                  data-interactive="true"
                  onClick={() => {
                    sounds.playPounce();
                    lastManualActionRef.current = Date.now();
                    walkTo(currentRoomPoints.toy.x, currentRoomPoints.toy.y, 'playing');
                    onObjectClick('toy');
                  }}
                  className="pointer-events-auto cursor-pointer group flex flex-col items-center btn-press"
                  title="Mainan Tongkat Bulu (Klik untuk bermain)"
                >
                  <div className="w-10 h-10 rounded-full bg-[#FAF8F5] dark:bg-[#1E1C1A] border border-[#BDB2A6] dark:border-[#423C36] flex items-center justify-center transition-colors group-hover:border-[var(--accent)]">
                    <CircleDot className="w-4 h-4 text-[var(--accent)]" />
                  </div>
                  <span className="font-mono text-[10px] text-[#756A5E] dark:text-[#B5ACA1] mt-1 uppercase tracking-wider">
                    TOY
                  </span>
                </div>

                <div
                  data-interactive="true"
                  onClick={() => {
                    sounds.playCrunch();
                    lastManualActionRef.current = Date.now();
                    walkTo(currentRoomPoints.bowl.x, currentRoomPoints.bowl.y, 'eating');
                    onObjectClick('bowl');
                  }}
                  className="pointer-events-auto cursor-pointer group flex flex-col items-center btn-press"
                  title="Mangkok Pakan Kering (Klik untuk memberi makan)"
                >
                  <div className="w-14 sm:w-16 h-8 sm:h-9 rounded-[50%] bg-[#F5EFE6] dark:bg-[#141311] border border-[#C8BFB3] dark:border-[#38332E] flex items-center justify-center transition-colors group-hover:border-[var(--accent)]">
                    <span className="font-mono text-[9px] text-[#5A5046] dark:text-[#FAF8F5]">KIBBLE</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#756A5E] dark:text-[#B5ACA1] mt-1 uppercase tracking-wider">
                    BOWL
                  </span>
                </div>
              </div>
            </>
          )}

          {/* ROOM 2: SUNNY BALCONY STATIONS */}
          {currentRoom === 'balcony' && (
            <>
              {/* Fresh Cat Grass Planter (Left) */}
              <div
                data-interactive="true"
                onClick={() => {
                  sounds.playGrassCrunch();
                  lastManualActionRef.current = Date.now();
                  walkTo(currentRoomPoints.grass.x, currentRoomPoints.grass.y, 'eating');
                  onObjectClick('cat_grass');
                }}
                className="pointer-events-auto cursor-pointer group flex flex-col items-center btn-press z-10"
                title="Pot Rumput Gandum (Klik untuk makan serat segar pelancar pencernaan)"
              >
                <div className="relative w-22 sm:w-26 h-14 sm:h-16 rounded-lg bg-[#C75D35] dark:bg-[#682F1B] border border-[#A44925] p-1 flex flex-col justify-end items-center transition-colors group-hover:border-[#4A7C59]">
                  <div className="flex gap-1 items-end mb-1">
                    <Sprout className="w-4 h-4 text-emerald-300 animate-pulse" />
                    <Sprout className="w-5 h-5 text-emerald-200" />
                    <Sprout className="w-4 h-4 text-emerald-300" />
                  </div>
                  <span className="font-mono text-[8px] text-white font-bold">WHEATGRASS</span>
                </div>
                <span className="font-mono text-[10px] text-[#756A5E] dark:text-[#B5ACA1] mt-1 uppercase tracking-wider">
                  CAT GRASS
                </span>
              </div>

              {/* Sunbathing Wooden Deck (Center) */}
              <div
                data-interactive="true"
                onClick={(e) => {
                  e.stopPropagation();
                  sounds.playPurr();
                  lastManualActionRef.current = Date.now();
                  walkTo(0, 4, 'happy');
                }}
                className="pointer-events-auto relative flex flex-col items-center justify-end -mb-1 cursor-pointer group z-10"
                title="Dek Berjemur (Klik untuk bersantai di bawah sinar hangat)"
              >
                <div className="w-56 sm:w-72 h-18 sm:h-22 rounded-xl bg-[#C8B8A6] dark:bg-[#2F261E] border border-[#A89886] dark:border-[#4A3D30] transition-colors group-hover:border-[var(--accent)] flex items-center justify-center">
                  <div className="flex items-center gap-2 font-mono text-[10px] text-[#5A5046] dark:text-[#B5ACA1]">
                    <Sun className="w-4 h-4 text-[#C75D35]" />
                    <span>SUNBATHING SPOT</span>
                  </div>
                </div>
                <span className="font-mono text-[9px] text-[#8E8376] dark:text-[#7E756B] mt-1 uppercase tracking-wider">
                  BALCONY DECK
                </span>
              </div>

              {/* Butterfly Station (Right) */}
              <div
                data-interactive="true"
                onClick={() => {
                  sounds.playPounce();
                  lastManualActionRef.current = Date.now();
                  walkTo(currentRoomPoints.butterfly.x, currentRoomPoints.butterfly.y, 'playing');
                  onObjectClick('butterfly');
                }}
                className="pointer-events-auto cursor-pointer group flex flex-col items-center btn-press z-10"
                title="Kupu-kupu Emas (Klik untuk mengintai dan menangkap)"
              >
                <motion.div
                  animate={{ y: [-5, 6, -5], rotate: [-4, 6, -4] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-12 h-12 rounded-full bg-[#FAF8F5] dark:bg-[#1E1C1A] border border-[#BDB2A6] dark:border-[#423C36] flex items-center justify-center transition-colors group-hover:border-[var(--accent)]"
                >
                  <Sparkles className="w-5 h-5 text-[#E5B558]" />
                </motion.div>
                <span className="font-mono text-[10px] text-[#756A5E] dark:text-[#B5ACA1] mt-1 uppercase tracking-wider">
                  BUTTERFLY
                </span>
              </div>
            </>
          )}

          {/* ROOM 3: COZY BEDROOM STATIONS */}
          {currentRoom === 'bedroom' && (
            <>
              {/* Luxury Queen Bed (Left) */}
              <div
                data-interactive="true"
                onClick={() => {
                  sounds.playSleepChime();
                  lastManualActionRef.current = Date.now();
                  walkTo(currentRoomPoints.bed.x, currentRoomPoints.bed.y, isSleeping ? 'idle' : 'sleeping');
                  onObjectClick('bed');
                }}
                className="pointer-events-auto cursor-pointer group flex flex-col items-center btn-press z-10"
                title="Kasur Tidur Nyenyak (Klik untuk regenerasi energi 1.5x)"
              >
                <div className="relative w-28 sm:w-34 h-16 sm:h-20 rounded-2xl bg-[#D8CEBF] dark:bg-[#2A2622] border border-[#BDB2A6] dark:border-[#423C36] flex flex-col items-center justify-center transition-colors group-hover:border-[var(--accent)]">
                  <div className="w-4/5 h-3/5 rounded-xl bg-[#EAE2D7] dark:bg-[#332E28] border border-[#D5CDC2] dark:border-[#48423B] flex items-center justify-center">
                    <Bed className="w-4 h-4 text-[#756A5E] dark:text-[#B5ACA1]" />
                  </div>
                  {isSleeping && (
                    <div className="absolute -top-3 font-mono text-[9px] font-semibold text-[var(--accent)] bg-[#FCFBF8] dark:bg-[#181615] border border-[#E7E2DA] dark:border-[#2D2A26] px-2 py-0.5 rounded">
                      DEEP SLEEP
                    </div>
                  )}
                </div>
                <span className="font-mono text-[10px] text-[#756A5E] dark:text-[#B5ACA1] mt-1 uppercase tracking-wider">
                  PLUSH BED
                </span>
              </div>

              {/* Bedroom Snuggle Rug (Center) */}
              <div
                data-interactive="true"
                onClick={(e) => {
                  e.stopPropagation();
                  sounds.playPurr();
                  lastManualActionRef.current = Date.now();
                  walkTo(0, 0, 'sitting');
                }}
                className="pointer-events-auto relative flex flex-col items-center justify-end -mb-1 cursor-pointer group z-10"
                title="Matras Beludru (Klik untuk bersantai di samping kasur)"
              >
                <div className="w-56 sm:w-72 h-18 sm:h-22 rounded-[50%] bg-[#DFD5C6] dark:bg-[#25221F] border border-[#C5B8A6] dark:border-[#38332E] transition-colors group-hover:border-[var(--accent)] flex items-center justify-center">
                  <span className="font-mono text-[9px] text-[#756A5E] dark:text-[#B5ACA1]">VELVET MAT</span>
                </div>
                <span className="font-mono text-[9px] text-[#8E8376] dark:text-[#7E756B] mt-1 uppercase tracking-wider">
                  BEDROOM RUG
                </span>
              </div>

              {/* Touch Lamp Nightstand (Right) */}
              <div
                data-interactive="true"
                onClick={() => {
                  sounds.playClick();
                  setBedroomLampOn(!bedroomLampOn);
                }}
                className="pointer-events-auto cursor-pointer group flex flex-col items-center btn-press z-10"
                title="Lampu Meja (Klik untuk menyalakan/mematikan lampu)"
              >
                <div className={`w-12 h-14 rounded-t-lg border flex flex-col items-center justify-center transition-colors ${
                  bedroomLampOn
                    ? 'bg-[#FFE9B3] dark:bg-[#423315] border-[#E5B558]'
                    : 'bg-[#FAF8F5] dark:bg-[#1E1C1A] border-[#BDB2A6] dark:border-[#423C36]'
                }`}>
                  <Lightbulb className={`w-5 h-5 ${bedroomLampOn ? 'text-[#C75D35]' : 'text-[#756A5E]'}`} />
                </div>
                <span className="font-mono text-[10px] text-[#756A5E] dark:text-[#B5ACA1] mt-1 uppercase tracking-wider">
                  NIGHT LAMP
                </span>
              </div>
            </>
          )}

          {/* ROOM 4: KITCHEN & PANTRY STATIONS */}
          {currentRoom === 'kitchen' && (
            <>
              {/* Electric Water Fountain (Left) */}
              <div
                data-interactive="true"
                onClick={() => {
                  sounds.playWaterStream();
                  lastManualActionRef.current = Date.now();
                  walkTo(currentRoomPoints.fountain.x, currentRoomPoints.fountain.y, 'curious');
                  onObjectClick('water_fountain');
                }}
                className="pointer-events-auto cursor-pointer group flex flex-col items-center btn-press z-10"
                title="Air Mancur Mengalir (Klik untuk minum air segar mengalir)"
              >
                <div className="relative w-22 sm:w-26 h-14 sm:h-16 rounded-full bg-[#E5EDF4] dark:bg-[#1D2733] border border-[#B0C7DA] dark:border-[#34485D] flex items-center justify-center transition-colors group-hover:border-[var(--accent)]">
                  <div className="w-3/4 h-3/4 rounded-full bg-[#CCE1F0] dark:bg-[#253748] flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-sky-500 animate-bounce" />
                  </div>
                </div>
                <span className="font-mono text-[10px] text-[#756A5E] dark:text-[#B5ACA1] mt-1 uppercase tracking-wider">
                  FOUNTAIN
                </span>
              </div>

              {/* Fish Floor Mat (Center) */}
              <div
                data-interactive="true"
                onClick={(e) => {
                  e.stopPropagation();
                  sounds.playPurr();
                  lastManualActionRef.current = Date.now();
                  walkTo(0, 0, 'sitting');
                }}
                className="pointer-events-auto relative flex flex-col items-center justify-end -mb-1 cursor-pointer group z-10"
                title="Matras Dapur Sejuk (Klik untuk bersantai di lantai ubin sejuk)"
              >
                <div className="w-56 sm:w-72 h-18 sm:h-22 rounded-2xl bg-[#DFD8CC] dark:bg-[#25221F] border border-[#C5BCB0] dark:border-[#38332E] transition-colors group-hover:border-[var(--accent)] flex items-center justify-center">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#756A5E] dark:text-[#B5ACA1]">
                    <Fish className="w-4 h-4 text-[var(--accent)]" />
                    <span>COOL TILE MAT</span>
                  </div>
                </div>
                <span className="font-mono text-[9px] text-[#8E8376] dark:text-[#7E756B] mt-1 uppercase tracking-wider">
                  KITCHEN MAT
                </span>
              </div>

              {/* Gourmet Salmon Treat Counter (Right) */}
              <div
                data-interactive="true"
                onClick={() => {
                  sounds.playCrunch();
                  lastManualActionRef.current = Date.now();
                  walkTo(currentRoomPoints.treats.x, currentRoomPoints.treats.y, 'eating');
                  onObjectClick('treat');
                }}
                className="pointer-events-auto cursor-pointer group flex flex-col items-center btn-press z-10"
                title="Camilan Salmon Segar (Klik untuk memberi camilan potongan salmon)"
              >
                <div className="w-14 sm:w-16 h-10 sm:h-12 rounded-lg bg-[#C75D35] dark:bg-[#853416] border border-[#A24420] flex items-center justify-center transition-colors group-hover:border-[var(--accent)]">
                  <div className="flex flex-col items-center">
                    <Fish className="w-4 h-4 text-[#FFF0E6]" />
                    <span className="font-mono text-[8px] text-[#FFF0E6] font-bold">SALMON</span>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-[#756A5E] dark:text-[#B5ACA1] mt-1 uppercase tracking-wider">
                  TREAT BOX
                </span>
              </div>
            </>
          )}

        </div>

        {/* ================= 4. AUTONOMOUS & DRAGGABLE CAT CHARACTER ================= */}
        <motion.div
          drag={!isSleeping}
          dragConstraints={{ left: -215, right: 215, top: -20, bottom: 25 }}
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
            sounds.playEmotionalMeow('curious', gender);
            lastManualActionRef.current = Date.now();
          }}
          onDragEnd={(_e, info) => {
            setIsDragging(false);

            const dragDist = Math.hypot(info.offset.x, info.offset.y);
            if (dragDist < 6) {
              sounds.playEmotionalMeow(internalState, gender);
              onCatClick();
              return;
            }

            const newX = Math.max(-210, Math.min(210, Math.round(position.x + info.offset.x)));
            const newY = Math.max(-18, Math.min(25, Math.round(position.y + info.offset.y)));

            if (newX > position.x) setFacingDirection(1);
            else if (newX < position.x) setFacingDirection(-1);

            setPosition({ x: newX, y: newY });
            lastManualActionRef.current = Date.now();
            sounds.playEmotionalMeow('happy', gender);

            // Settle down reaction
            setInternalState('happy');
            setTimeout(() => {
              setInternalState((prev) => (prev === 'happy' ? 'sitting' : prev));
            }, 1400);
          }}
          className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-20 cat-character-container pointer-events-auto select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          title="Tarik (drag) untuk memindahkan, atau klik untuk mengelus"
        >
          <CatCharacter
            customization={customization}
            state={internalState}
            gender={gender}
            onClick={() => {
              if (!isDragging) {
                sounds.playEmotionalMeow(internalState, gender);
                onCatClick();
              }
            }}
            size="lg"
            showShadow={true}
          />
        </motion.div>

      </div>

      {/* Control Guidance & Telemetry Footer Bar (Strictly Below Room Canvas - Zero Overlap) */}
      <div className="mt-3.5 pt-3 border-t border-[#E7E2DA] dark:border-[#2D2A26] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 font-mono text-xs text-[#756A5E] dark:text-[#B5ACA1]">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#F4F0E8] dark:bg-[#1E1C1A] border border-[#E7E2DA] dark:border-[#2D2A26] text-[#22201D] dark:text-[#F6F4EE] font-semibold text-[10px]">
            <Hand className="w-3 h-3 text-[var(--accent)]" />
            <span>KONTROL INTERAKTIF</span>
          </div>
          <span className="text-[11px]">
            Klik lantai untuk memanggil • Tarik (drag) untuk memindahkan • Ganti latar untuk fitur ruangan berbeda
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-[#9E9284] dark:text-[#7E756B] self-end sm:self-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>SIMULASI AKTIF</span>
        </div>
      </div>

    </div>
  );
};
