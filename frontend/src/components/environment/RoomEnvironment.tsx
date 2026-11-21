import React from 'react';
import { motion } from 'framer-motion';
import { PetState, CatCustomization } from '../../types/pet';
import { CatCharacter } from '../cat/CatCharacter';
import { Sun, Moon, CloudSun, Home, Bed, Trees, CircleDot, Info } from 'lucide-react';
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
  const currentHour = new Date().getHours();
  const timeOfDay = currentHour >= 6 && currentHour < 16 ? 'day' : currentHour >= 16 && currentHour < 19 ? 'sunset' : 'night';

  const roomStyles = {
    day: {
      windowSky: 'from-[#CFE4EE] to-[#E9DFCE]',
      ambient: 'bg-[#FCFBF8]',
    },
    sunset: {
      windowSky: 'from-[#DFA58E] via-[#E8C29D] to-[#E8DCCB]',
      ambient: 'bg-[#FAF6F0]',
    },
    night: {
      windowSky: 'from-[#1C2331] via-[#2A3447] to-[#1F2735]',
      ambient: 'bg-[#F4F1EA]',
    },
  }[timeOfDay];

  const rooms = [
    { id: 'living_room', label: 'LIVING ROOM', code: 'RM-01', icon: Home },
    { id: 'bedroom', label: 'BEDROOM', code: 'RM-02', icon: Bed },
    { id: 'balcony', label: 'BALCONY', code: 'RM-03', icon: Trees },
  ];

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-xl border border-[#E7E2DA] bg-[#FCFBF8] p-4 sm:p-5 transition-colors duration-200">
      
      {/* Top Header Bar: Room Switcher & Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 z-20 relative">
        <div className="flex items-center gap-1 p-0.5 rounded-lg border border-[#E7E2DA] bg-[#F8F6F1]">
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
                    ? 'bg-[#FCFBF8] text-[#22201D] border border-[#E7E2DA] font-semibold'
                    : 'text-[#756A5E] hover:text-[#22201D]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{room.label}</span>
              </button>
            );
          })}
        </div>

        {/* Ambient Time Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E7E2DA] bg-[#FCFBF8] font-mono text-[11px] text-[#5A5046]">
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
              <Moon className="w-3.5 h-3.5 text-[#5A5046]" />
              <span>NIGHT MODE</span>
            </>
          )}
        </div>
      </div>

      {/* Main Room Canvas */}
      <div className="relative w-full h-[360px] sm:h-[400px] rounded-lg overflow-hidden border border-[#E7E2DA] bg-[#F4F0E8] flex flex-col justify-between">
        
        {/* Architectural Back Wall Elements */}
        <div className="absolute inset-0 flex justify-between p-6 pointer-events-none">
          {/* Wall Window with Clean Geometric Panes */}
          <div className="relative w-28 sm:w-32 h-36 sm:h-40 rounded-t-lg border border-[#D5CDC2] bg-[#FAF8F5] overflow-hidden">
            <div className={`w-full h-full bg-gradient-to-b ${roomStyles.windowSky} relative flex items-center justify-center`}>
              {timeOfDay === 'night' ? (
                <div className="w-5 h-5 rounded-full bg-[#E7E2DA] opacity-80" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#E5B558] opacity-75" />
              )}
              {/* Window Mullions Grid */}
              <div className="absolute inset-0 border-r border-[#FAF8F5]/70 left-1/2" />
              <div className="absolute inset-0 border-b border-[#FAF8F5]/70 top-1/2" />
            </div>
            {/* Sill */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#D5CDC2]" />
          </div>

          {/* Minimalist Wall Frame */}
          <div className="hidden sm:block p-2 bg-[#FAF8F5] border border-[#D5CDC2] rounded w-20 h-24">
            <div className="w-full h-14 bg-[#E7E2DA] rounded flex items-center justify-center font-mono text-[9px] text-[#756A5E]">
              SPEC
            </div>
            <div className="font-mono text-[9px] text-center text-[#756A5E] mt-1.5 uppercase tracking-wider">
              {catName}
            </div>
          </div>

          {/* Clean Hanging Shelf */}
          <div className="relative w-32 h-2 bg-[#D5CDC2] rounded-xs top-6">
            <div className="absolute -top-4 left-3 flex gap-1 items-end">
              <div className="w-2 h-4 bg-[#C75D35] rounded-2xs" />
              <div className="w-2 h-5 bg-[#4A7C59] rounded-2xs" />
              <div className="w-2 h-3.5 bg-[#756A5E] rounded-2xs" />
            </div>
          </div>
        </div>

        {/* Floor Transition & Clean Planks */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-[#E8DFCFC0] border-t border-[#D5CDC2]">
          <div className="w-full h-full opacity-15 bg-[linear-gradient(90deg,transparent_49%,rgba(34,32,29,0.3)_50%,transparent_51%)] bg-[length:100px_100%]" />
        </div>

        {/* Interactive Floor Objects */}
        <div className="relative w-full h-full flex items-end justify-between px-4 sm:px-10 pb-4 z-10 pointer-events-auto">

          {/* 1. Bed (Left) */}
          <div
            onClick={() => {
              sounds.playClick();
              onObjectClick('bed');
            }}
            className="cursor-pointer group flex flex-col items-center btn-press"
            title="Tempat Tidur (Klik untuk tidur atau bangun)"
          >
            <div className="relative w-24 sm:w-28 h-12 sm:h-14 rounded-full bg-[#DACDBE] border border-[#BDB2A6] flex items-center justify-center transition-colors group-hover:border-[#C75D35]">
              <div className="w-4/5 h-4/5 rounded-full bg-[#EAE2D7] border border-[#D5CDC2] flex items-center justify-center">
                <Bed className="w-3.5 h-3.5 text-[#756A5E]" />
              </div>
              {isSleeping && (
                <div className="absolute -top-3 font-mono text-[9px] font-semibold text-[#C75D35] bg-[#FCFBF8] border border-[#E7E2DA] px-1.5 py-0.2 rounded">
                  ASLEEP
                </div>
              )}
            </div>
            <span className="font-mono text-[10px] text-[#756A5E] group-hover:text-[#22201D] transition-colors mt-1.5 uppercase tracking-wider">
              BED UNIT
            </span>
          </div>

          {/* 2. Center Area: Floor Rug & Virtual Cat */}
          <div className="relative flex flex-col items-center justify-end -mb-2">
            {/* Minimalist Elliptical Rug */}
            <div className="absolute bottom-1 w-48 sm:w-64 h-16 sm:h-20 rounded-[50%] bg-[#EFE9DF] border border-[#D5CDC2]" />

            {/* Virtual Cat */}
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

          {/* 3. Right Side: Food Bowl + Toy */}
          <div className="flex items-end gap-3 sm:gap-4">
            
            {/* Toy */}
            <div
              onClick={() => {
                sounds.playPounce();
                onObjectClick('toy');
              }}
              className="cursor-pointer group flex flex-col items-center btn-press"
              title="Mainan (Klik untuk bermain)"
            >
              <div className="w-9 h-9 rounded-full bg-[#FAF8F5] border border-[#BDB2A6] flex items-center justify-center transition-colors group-hover:border-[#C75D35]">
                <CircleDot className="w-4 h-4 text-[#C75D35]" />
              </div>
              <span className="font-mono text-[10px] text-[#756A5E] group-hover:text-[#22201D] transition-colors mt-1.5 uppercase tracking-wider">
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
              <div className="w-12 sm:w-14 h-7 sm:h-8 rounded-[50%] bg-[#22201D] border border-[#141311] flex items-center justify-center transition-colors group-hover:border-[#C75D35]">
                <div className="w-4/5 h-3/5 rounded-[50%] bg-[#5A5046] flex items-center justify-center font-mono text-[9px] text-[#FAF8F5]">
                  FEED
                </div>
              </div>
              <span className="font-mono text-[10px] text-[#756A5E] group-hover:text-[#22201D] transition-colors mt-1.5 uppercase tracking-wider">
                BOWL
              </span>
            </div>
          </div>

        </div>

        {/* Minimalist Hint Bar */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#FCFBF8]/90 px-3 py-1 rounded border border-[#E7E2DA] flex items-center gap-1.5 font-mono text-[10px] text-[#756A5E] pointer-events-none">
          <Info className="w-3 h-3 text-[#9E9284]" />
          <span>KLIK KARAKTER ATAU OBJEK UNTUK BERINTERAKSI</span>
        </div>
      </div>
    </div>
  );
};
