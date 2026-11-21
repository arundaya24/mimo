import React, { useState } from 'react';
import { Volume2, VolumeX, LogOut, Plus, BookOpen } from 'lucide-react';
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
    <header className="sticky top-0 z-40 bg-[#F8F6F1]/95 backdrop-blur-md border-b border-[#E7E2DA] px-4 sm:px-8 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Identifier */}
        <div
          onClick={() => {
            sounds.playClick();
            onNavigateHome();
          }}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-8 h-8 rounded-lg bg-[#22201D] text-[#F8F6F1] flex items-center justify-center font-mono font-bold text-xs border border-[#22201D] transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:bg-[#C75D35] group-hover:border-[#C75D35]">
            M
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-sans text-base font-bold tracking-tight text-[#22201D]">
              MIMO
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#756A5E] hidden sm:inline">
              SYS.V1
            </span>
          </div>
        </div>

        {/* Right Navigation & Telemetry */}
        <div className="flex items-center gap-2.5">
          
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={isMuted ? 'Nyalakan audio' : 'Senyapkan audio'}
            className="btn-press p-2 rounded-lg border border-[#E7E2DA] bg-[#FCFBF8] text-[#756A5E] hover:text-[#22201D] hover:border-[#C8BFB3] transition-colors"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-[#9E9284]" /> : <Volume2 className="w-3.5 h-3.5 text-[#C75D35]" />}
          </button>

          {user ? (
            <>
              {/* Journal / Diary */}
              {hasCat && onOpenDiary && (
                <button
                  onClick={() => {
                    sounds.playClick();
                    onOpenDiary();
                  }}
                  className="btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E7E2DA] bg-[#FCFBF8] text-[#47433E] text-xs font-medium hover:border-[#C8BFB3] hover:text-[#22201D] transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#756A5E]" />
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
                  className="btn-press cta-shimmer flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#22201D] text-[#FCFBF8] text-xs font-semibold hover:bg-[#322F2B] transition-colors border border-[#22201D]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="font-mono text-[11px] uppercase tracking-wide">
                    {hasCat ? 'Adopsi Baru' : 'Mulai Adopsi'}
                  </span>
                </button>
              )}

              {/* User Identity Pill */}
              <div className="flex items-center gap-2 pl-2 border-l border-[#E7E2DA]">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-semibold text-[#22201D] leading-tight">
                    {user.name}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[#9E9284] leading-tight">
                    OPERATOR
                  </span>
                </div>
                <button
                  onClick={() => {
                    sounds.playClick();
                    onLogout();
                  }}
                  title="Keluar akun"
                  className="btn-press p-1.5 text-[#9E9284] hover:text-[#AF4A24] rounded transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-[#756A5E]">
                READY
              </span>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
