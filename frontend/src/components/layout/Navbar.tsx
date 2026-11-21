import React, { useState } from 'react';
import { Volume2, VolumeX, LogOut, Plus, BookOpen, Settings } from 'lucide-react';
import { sounds } from '../../audio/soundSynth';
import { User } from '../../types/pet';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onNavigateHome: () => void;
  onNavigateAdopt?: () => void;
  onOpenDiary?: () => void;
  onNavigateSettings?: () => void;
  hasCat?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onNavigateHome,
  onNavigateAdopt,
  onOpenDiary,
  onNavigateSettings,
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
    <header className="sticky top-0 z-40 bg-[#F8F6F1]/95 dark:bg-[#121110]/95 backdrop-blur-md border-b border-[#E7E2DA] dark:border-[#2D2A26] px-4 sm:px-8 py-3 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Identifier */}
        <div
          onClick={() => {
            sounds.playClick();
            onNavigateHome();
          }}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-8 h-8 rounded-lg bg-[#22201D] dark:bg-[#F6F4EE] text-[#F8F6F1] dark:text-[#121110] flex items-center justify-center font-mono font-bold text-xs border border-[#22201D] dark:border-[#F6F4EE] transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:bg-[var(--accent)] group-hover:border-[var(--accent)]">
            M
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-sans text-base font-bold tracking-tight text-[#22201D] dark:text-[#F6F4EE]">
              MIMO
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#756A5E] dark:text-[#B5ACA1] hidden sm:inline">
              SYS.V1
            </span>
          </div>
        </div>

        {/* Right Navigation & Telemetry */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={isMuted ? 'Nyalakan audio' : 'Senyapkan audio'}
            className="btn-press p-2 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#181615] text-[#756A5E] dark:text-[#B5ACA1] hover:text-[#22201D] dark:hover:text-[#F6F4EE] hover:border-[#C8BFB3] dark:hover:border-[#48433E] transition-colors"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-[#9E9284]" /> : <Volume2 className="w-3.5 h-3.5 text-[var(--accent)]" />}
          </button>

          {/* Settings Button */}
          {onNavigateSettings && (
            <button
              onClick={() => {
                sounds.playClick();
                onNavigateSettings();
              }}
              title="Pengaturan sistem"
              className="btn-press p-2 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#181615] text-[#756A5E] dark:text-[#B5ACA1] hover:text-[#22201D] dark:hover:text-[#F6F4EE] hover:border-[#C8BFB3] dark:hover:border-[#48433E] transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}

          {user ? (
            <>
              {/* Journal / Diary */}
              {hasCat && onOpenDiary && (
                <button
                  onClick={() => {
                    sounds.playClick();
                    onOpenDiary();
                  }}
                  className="btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#181615] text-[#47433E] dark:text-[#B5ACA1] text-xs font-medium hover:border-[#C8BFB3] hover:text-[#22201D] dark:hover:text-[#F6F4EE] transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#756A5E] dark:text-[#B5ACA1]" />
                  <span className="hidden sm:inline font-mono text-[11px]">DIARY</span>
                </button>
              )}

              {/* Adopt New Button */}
              {onNavigateAdopt && (
                <button
                  onClick={() => {
                    sounds.playClick();
                    onNavigateAdopt();
                  }}
                  className="btn-press cta-shimmer flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg bg-[#22201D] dark:bg-[#F6F4EE] text-[#FCFBF8] dark:text-[#121110] text-xs font-semibold hover:bg-[#322F2B] transition-colors border border-[#22201D] dark:border-[#F6F4EE]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="font-mono text-[11px] uppercase tracking-wide">
                    {hasCat ? 'Adopsi Baru' : 'Mulai Adopsi'}
                  </span>
                </button>
              )}

              {/* User Identity Pill */}
              <div className="flex items-center gap-2 pl-2 border-l border-[#E7E2DA] dark:border-[#2D2A26]">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-semibold text-[#22201D] dark:text-[#F6F4EE] leading-tight">
                    {user.name}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[#9E9284] dark:text-[#7E756B] leading-tight">
                    OPERATOR
                  </span>
                </div>
                <button
                  onClick={() => {
                    sounds.playClick();
                    onLogout();
                  }}
                  title="Keluar akun"
                  className="btn-press p-1.5 text-[#9E9284] hover:text-rose-600 rounded transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-[#756A5E] dark:text-[#B5ACA1]">
                READY
              </span>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
