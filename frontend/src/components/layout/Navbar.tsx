import React, { useState } from 'react';
import { Volume2, VolumeX, LogOut, Heart, Sparkles, BookOpen } from 'lucide-react';
import { sounds } from '../../audio/soundSynth';
import { User } from '../../types/pet';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onNavigateHome: () => void;
  onNavigateAdopt?: () => void;
  onOpenDiary?: () => void;
  hasCat?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onNavigateHome,
  onNavigateAdopt,
  onOpenDiary,
  hasCat,
}) => {
  const [isMuted, setIsMuted] = useState(!sounds.enabled);

  const toggleSound = () => {
    sounds.enabled = !sounds.enabled;
    setIsMuted(!sounds.enabled);
    if (sounds.enabled) {
      sounds.playClick();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-cream-100/90 backdrop-blur-md border-b border-cream-300/80 px-4 sm:px-8 py-3 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Tagline */}
        <div
          onClick={() => {
            sounds.playClick();
            onNavigateHome();
          }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-terracotta-500 text-white flex items-center justify-center text-xl shadow-sm group-hover:scale-105 transition-transform">
            🐾
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading text-2xl font-bold tracking-tight text-charcoal-900">
                MIMO
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-terracotta-100 text-terracotta-700">
                PET
              </span>
            </div>
            <p className="text-[11px] text-brown-500 font-medium hidden sm:block -mt-1">
              A little life to care for.
            </p>
          </div>
        </div>

        {/* Right Navigation & Control Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Sound Toggle Button */}
          <button
            onClick={toggleSound}
            title={isMuted ? 'Nyalakan Efek Suara' : 'Bisukan Efek Suara'}
            className="p-2 rounded-xl border border-cream-300 bg-white/80 text-brown-600 hover:text-charcoal-800 hover:bg-white transition-all shadow-2xs"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-brown-400" /> : <Volume2 className="w-4 h-4 text-terracotta-600" />}
          </button>

          {user ? (
            <>
              {/* Cat Diary / Journal Button */}
              {hasCat && onOpenDiary && (
                <button
                  onClick={() => {
                    sounds.playClick();
                    onOpenDiary();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cream-300 bg-white/80 text-charcoal-700 text-xs font-medium hover:bg-cream-50 hover:border-cream-400 transition-all shadow-2xs"
                >
                  <BookOpen className="w-3.5 h-3.5 text-brown-500" />
                  <span className="hidden md:inline">Buku Harian</span>
                </button>
              )}

              {/* Adopt Cat Shortcut if needed */}
              {onNavigateAdopt && (
                <button
                  onClick={() => {
                    sounds.playClick();
                    onNavigateAdopt();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-terracotta-500 text-white text-xs font-semibold hover:bg-terracotta-600 transition-all shadow-2xs"
                >
                  <Heart className="w-3.5 h-3.5 fill-white" />
                  <span>{hasCat ? 'Adopsi Kucing Baru' : 'Mulai Adopsi'}</span>
                </button>
              )}

              {/* User Profile Pill */}
              <div className="flex items-center gap-2 pl-2 border-l border-cream-300">
                <div className="w-8 h-8 rounded-full bg-honey-200 border border-honey-300 flex items-center justify-center font-bold text-xs text-brown-700">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold text-charcoal-800 leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-brown-400 leading-tight">
                    Pemilik Terdaftar
                  </span>
                </div>
                <button
                  onClick={() => {
                    sounds.playClick();
                    onLogout();
                  }}
                  title="Keluar"
                  className="p-1.5 text-brown-400 hover:text-rose-600 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-brown-500 hidden sm:inline">
                Temukan teman barumu
              </span>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
