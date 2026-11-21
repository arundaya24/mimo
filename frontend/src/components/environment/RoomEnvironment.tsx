import React from 'react';
import { motion } from 'framer-motion';
import { PetState, CatCustomization } from '../../types/pet';
import { CatCharacter } from '../cat/CatCharacter';
import { Sparkles, Sun, Moon, CloudSun } from 'lucide-react';
import { sounds } from '../../audio/soundSynth';

interface RoomEnvironmentProps {
  customization: CatCustomization;
  state: PetState;
  catName: string;
  isSleeping: boolean;
  onCatClick: () => void;
  onObjectClick: (objectType: string) => void;
  currentRoom?: string;
  onRoomChange?: (room: string) => void;
}

export const RoomEnvironment: React.FC<RoomEnvironmentProps> = ({
  customization,
  state,
  catName,
  isSleeping,
  onCatClick,
  onObjectClick,
  currentRoom = 'living_room',
  onRoomChange,
}) => {
  // Determine ambient lighting based on local user clock
  const currentHour = new Date().getHours();
  const timeOfDay = currentHour >= 6 && currentHour < 16 ? 'day' : currentHour >= 16 && currentHour < 19 ? 'sunset' : 'night';

  const roomStyles = {
    day: {
      bg: 'from-amber-50/60 via-cream-100 to-amber-100/40',
      windowGlow: 'bg-amber-100/60 border-amber-200',
      windowSky: 'from-sky-200 to-amber-100',
      sunColor: 'text-amber-500',
    },
    sunset: {
      bg: 'from-orange-100/50 via-cream-100 to-terracotta-100/30',
      windowGlow: 'bg-orange-200/50 border-orange-300',
      windowSky: 'from-terracotta-400 via-amber-300 to-orange-200',
      sunColor: 'text-orange-500',
    },
    night: {
      bg: 'from-slate-900/10 via-cream-200/60 to-charcoal-700/10',
      windowGlow: 'bg-indigo-950/20 border-slate-300',
      windowSky: 'from-indigo-950 via-slate-900 to-indigo-900',
      sunColor: 'text-amber-200',
    },
  }[timeOfDay];

  const rooms = [
    { id: 'living_room', label: 'Ruang Tamu', icon: '🛋️' },
    { id: 'bedroom', label: 'Kamar Tidur', icon: '🛏️' },
    { id: 'balcony', label: 'Balkon Hijau', icon: '🌿' },
  ];

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-3xl overflow-hidden border-2 border-cream-300 shadow-xl bg-gradient-to-b from-cream-50 via-cream-100 to-amber-50/70 p-4 sm:p-6 transition-all duration-700">
      
      {/* Top Header Bar inside room: Room Switcher & Ambience pill */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 z-20 relative">
        <div className="flex items-center gap-1.5 bg-cream-200/80 backdrop-blur-sm p-1 rounded-2xl border border-cream-300">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => {
                sounds.playClick();
                onRoomChange?.(room.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                currentRoom === room.id
                  ? 'bg-white text-charcoal-800 shadow-sm border border-cream-300 font-semibold'
                  : 'text-brown-600 hover:text-charcoal-800 hover:bg-cream-100'
              }`}
            >
              <span className="mr-1.5">{room.icon}</span>
              {room.label}
            </button>
          ))}
        </div>

        {/* Time of Day Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/80 border border-cream-300 text-xs text-brown-600 shadow-sm">
          {timeOfDay === 'day' && (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
              <span>Pagi/Siang Cerah</span>
            </>
          )}
          {timeOfDay === 'sunset' && (
            <>
              <CloudSun className="w-3.5 h-3.5 text-terracotta-500" />
              <span>Senja Hangat</span>
            </>
          )}
          {timeOfDay === 'night' && (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Malam Tenang</span>
            </>
          )}
        </div>
      </div>

      {/* Main Room Canvas */}
      <div className="relative w-full h-[360px] sm:h-[420px] rounded-2xl overflow-hidden bg-gradient-to-b from-cream-200/50 to-cream-300/40 border border-cream-300/60 flex flex-col justify-between">
        
        {/* Back Wall Elements */}
        <div className="absolute inset-0 flex justify-between p-6 pointer-events-none">
          {/* Wall Window with Dynamic Sky */}
          <div className="relative w-28 sm:w-36 h-36 sm:h-44 rounded-t-full rounded-b-lg border-4 border-white shadow-md overflow-hidden bg-gradient-to-b">
            <div className={`w-full h-full bg-gradient-to-b ${roomStyles.windowSky} relative flex items-center justify-center`}>
              {timeOfDay === 'night' ? (
                <div className="relative">
                  <div className="w-6 h-6 rounded-full bg-amber-100 shadow-lg shadow-amber-100/50" />
                  <div className="absolute top-2 left-6 text-white text-[8px] animate-pulse">✦</div>
                  <div className="absolute -top-3 -left-4 text-white text-[10px] animate-pulse delay-300">✦</div>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-amber-300 shadow-lg shadow-amber-300/50" />
              )}
              {/* Window Panes Grid */}
              <div className="absolute inset-0 border-r-2 border-white/60 left-1/2 -ml-[1px]" />
              <div className="absolute inset-0 border-b-2 border-white/60 top-1/2 -mt-[1px]" />
            </div>
            {/* Window Sill with Mini Succulent */}
            <div className="absolute -bottom-1 left-0 right-0 h-3 bg-amber-900/30 rounded-sm" />
          </div>

          {/* Wall Art / Polaroid of Mimo */}
          <div className="hidden sm:block rotate-3 p-1.5 bg-white shadow-sm border border-cream-300 rounded-lg w-20 h-24">
            <div className="w-full h-14 bg-terracotta-100 rounded flex items-center justify-center text-xs">
              🐾
            </div>
            <div className="text-[9px] text-center font-cozy text-brown-600 mt-1 font-semibold">
              {catName} & Me
            </div>
          </div>

          {/* Hanging Shelf with Books & Plant */}
          <div className="relative w-36 h-3 bg-brown-300 rounded shadow-sm top-6">
            <div className="absolute -top-5 left-3 flex gap-1 items-end">
              <div className="w-2.5 h-5 bg-terracotta-400 rounded-sm" />
              <div className="w-2.5 h-6 bg-sage-500 rounded-sm" />
              <div className="w-2.5 h-4 bg-honey-500 rounded-sm" />
            </div>
            {/* Pothos Hanging Vine */}
            <div className="absolute -bottom-4 right-3 text-sage-600 text-sm">
              🌿
            </div>
          </div>
        </div>

        {/* Floor Transition & Texture */}
        <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-b from-[#EFE3D3] to-[#E5D7C4] border-t-2 border-[#D8C6B1]">
          {/* Subtle wood planks divider lines */}
          <div className="w-full h-full opacity-20 bg-[linear-gradient(90deg,transparent_49%,rgba(92,73,59,0.3)_50%,transparent_51%)] bg-[length:120px_100%]" />
        </div>

        {/* Interactive Floor Objects */}
        <div className="relative w-full h-full flex items-end justify-between px-4 sm:px-12 pb-4 z-10 pointer-events-auto">

          {/* 1. Cozy Cat Bed / Basket (Left side) */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              sounds.playClick();
              onObjectClick('bed');
            }}
            className="cursor-pointer group flex flex-col items-center"
            title="Tempat Tidur Mimo (Klik untuk tidur/bangun)"
          >
            <div className="relative w-24 sm:w-32 h-14 sm:h-18 rounded-[50%] bg-[#D7C2AC] border-4 border-[#BFA78F] shadow-inner flex items-center justify-center">
              {/* Soft Plaid Pillow inside */}
              <div className="w-4/5 h-4/5 rounded-[50%] bg-terracotta-200/80 shadow-sm flex items-center justify-center">
                <span className="text-xs opacity-60">☁️</span>
              </div>
              {isSleeping && (
                <div className="absolute -top-4 text-xs font-semibold text-terracotta-600 bg-white/90 px-2 py-0.5 rounded-full shadow-xs">
                  Nyenyak
                </div>
              )}
            </div>
            <span className="text-[11px] font-medium text-brown-600 group-hover:text-terracotta-600 transition-colors mt-1">
              Kasur Hangat
            </span>
          </motion.div>

          {/* 2. Center Area: Warm Bohemian Rug & CAT CHARACTER */}
          <div className="relative flex flex-col items-center justify-end -mb-2">
            {/* Round Bohemian Carpet */}
            <div className="absolute bottom-1 w-52 sm:w-72 h-20 sm:h-24 rounded-[50%] bg-[#F5EDE1] border-2 border-[#DFCDBA] shadow-xs flex items-center justify-center">
              <div className="w-5/6 h-5/6 rounded-[50%] border border-dashed border-terracotta-300/60" />
            </div>

            {/* The Animated Virtual Cat */}
            <div className="relative z-20">
              <CatCharacter
                customization={customization}
                state={state}
                onClick={onCatClick}
                size="lg"
                showShadow={true}
              />
            </div>
          </div>

          {/* 3. Right Side: Food & Water Bowl + Yarn Toy */}
          <div className="flex items-end gap-3 sm:gap-4">
            
            {/* Interactive Yarn Ball / Mouse */}
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              whileTap={{ scale: 0.85, y: -10 }}
              onClick={() => {
                sounds.playPounce();
                onObjectClick('toy');
              }}
              className="cursor-pointer group flex flex-col items-center"
              title="Bola Wol & Mainan (Klik untuk mengajak bermain)"
            >
              <div className="relative w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-honey-500 shadow-sm flex items-center justify-center border-2 border-honey-600">
                <div className="w-full h-full rounded-full border border-dashed border-amber-700/40" />
                <span className="absolute -bottom-1 -right-2 text-xs">🧶</span>
              </div>
              <span className="text-[10px] font-medium text-brown-600 group-hover:text-honey-600 transition-colors mt-1">
                Mainan
              </span>
            </motion.div>

            {/* Interactive Food Bowl */}
            <motion.div
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                sounds.playCrunch();
                onObjectClick('bowl');
              }}
              className="cursor-pointer group flex flex-col items-center"
              title="Mangkok Makan (Klik untuk memberi makan)"
            >
              <div className="relative w-14 sm:w-16 h-8 sm:h-9 rounded-[50%] bg-terracotta-500 border-2 border-terracotta-600 shadow-md flex items-center justify-center">
                {/* Food content */}
                <div className="w-4/5 h-3/5 rounded-[50%] bg-[#7D5638] flex items-center justify-center">
                  <span className="text-[8px] sm:text-[10px] text-amber-100 font-bold">🐟</span>
                </div>
              </div>
              <span className="text-[11px] font-medium text-brown-600 group-hover:text-terracotta-600 transition-colors mt-1">
                Mangkok
              </span>
            </motion.div>
          </div>

        </div>

        {/* Ambient Click Hint Prompt */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/70 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] text-brown-600 border border-cream-300 pointer-events-none shadow-2xs">
          💡 Sentuh {catName} atau benda di ruangan untuk berinteraksi
        </div>
      </div>
    </div>
  );
};
