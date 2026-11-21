import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CatCharacter } from '../components/cat/CatCharacter';
import { PetState, CatCustomization } from '../types/pet';
import { ArrowRight, Cpu, Clock, Sliders, Shield, Terminal, Activity } from 'lucide-react';
import { sounds } from '../audio/soundSynth';

interface LandingPageProps {
  onStartAdoption: () => void;
  onOpenLogin: () => void;
  isAuthenticated: boolean;
  hasCat: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartAdoption,
  onOpenLogin,
  isAuthenticated,
  hasCat,
}) => {
  const [demoState, setDemoState] = useState<PetState>('idle');
  const [demoGender, setDemoGender] = useState<'female' | 'male'>('female');

  const demoCustomization: CatCustomization = {
    fur_color: '#E69A57',
    fur_secondary_color: '#FFF8F0',
    pattern: 'stripes',
    pattern_color: '#A0522D',
    eye_color: '#48BB78',
    ear_style: 'pointy',
    collar_color: '#D97746',
    bell: true,
    accessory: 'none',
  };

  const handleStateSelect = (st: PetState) => {
    sounds.playClick();
    if (st === 'happy') sounds.playPurr();
    else if (st === 'playing') sounds.playPounce();
    else if (st === 'affectionate') sounds.playMeow();
    setDemoState(st);
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col justify-between bg-[#F8F6F1] dark:bg-[#121110] transition-colors">
      
      {/* Hero Section: Asymmetric 2-Column */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-8 sm:pt-12 pb-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Left-aligned typography with tight tracking */}
          <div className="lg:col-span-7 text-left space-y-6">
            
            {/* System Status Pill */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#181615] text-[#5A5046] dark:text-[#B5ACA1]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">
                SYSTEM CORE // VER 1.0.4
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#141311] dark:text-[#F6F4EE] leading-[1.08]">
              Virtual pet simulator dengan logika deterministik.
            </h1>

            <p className="text-sm sm:text-base text-[#5A5046] dark:text-[#B5ACA1] max-w-xl leading-relaxed font-normal">
              Bukan animasi video statis. MIMO menghitung emosi, kebutuhan energi, kebersihan, dan kenyamanan secara real-time di server. Saat peramban ditutup, siklus metabolisme tetap berjalan konsisten.
            </p>

            {/* CTA Group with Tactile Press & Shimmer */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={() => {
                  sounds.playClick();
                  if (isAuthenticated && hasCat) {
                    onStartAdoption();
                  } else if (isAuthenticated) {
                    onStartAdoption();
                  } else {
                    onOpenLogin();
                  }
                }}
                className="btn-press cta-shimmer px-6 py-3 rounded-lg bg-[#22201D] dark:bg-[#F6F4EE] hover:bg-[#322F2B] text-[#FCFBF8] dark:text-[#121110] font-mono text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 border border-[#22201D] dark:border-[#F6F4EE]"
              >
                <span>{isAuthenticated && hasCat ? 'Buka Ruang Kucing' : 'Adopsi Kucing Baru'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {!isAuthenticated && (
                <button
                  onClick={() => {
                    sounds.playClick();
                    onOpenLogin();
                  }}
                  className="btn-press px-5 py-3 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] hover:border-[#C8BFB3] dark:hover:border-[#48433E] bg-[#FCFBF8] dark:bg-[#181615] text-[#22201D] dark:text-[#F6F4EE] font-mono text-xs font-semibold tracking-wider uppercase transition-colors"
                >
                  Masuk Akun
                </button>
              )}
            </div>

            {/* Spec Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#E7E2DA] dark:border-[#2D2A26]">
              <div>
                <span className="font-mono text-[10px] uppercase text-[#9E9284] dark:text-[#7E756B] block">PARAMETERS</span>
                <span className="font-mono text-sm font-semibold text-[#141311] dark:text-[#F6F4EE] tabular-nums">08 SENSORS</span>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase text-[#9E9284] dark:text-[#7E756B] block">PERSONALITY</span>
                <span className="font-mono text-sm font-semibold text-[#141311] dark:text-[#F6F4EE] tabular-nums">05 TYPES</span>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase text-[#9E9284] dark:text-[#7E756B] block">ANIMATION</span>
                <span className="font-mono text-sm font-semibold text-[#141311] dark:text-[#F6F4EE] tabular-nums">12 STATES</span>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase text-[#9E9284] dark:text-[#7E756B] block">STORAGE</span>
                <span className="font-mono text-sm font-semibold text-[#141311] dark:text-[#F6F4EE] tabular-nums">PERSISTENT</span>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Hardware Panel Preview */}
          <div className="lg:col-span-5 w-full">
            <div className="bento-card rounded-xl p-5 border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#181615] text-left space-y-4">
              
              {/* Card Header Telemetry */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DA] dark:border-[#2D2A26]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#22201D] dark:text-[#F6F4EE]">
                    RENDER TESTBENCH
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#756A5E] dark:text-[#B5ACA1] uppercase">
                  STATE: {demoState}
                </span>
              </div>

              {/* Interactive Vector Cat Frame */}
              <div className="relative w-full h-64 bg-[#F4F0E8] dark:bg-[#1E1C1A] rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] flex items-center justify-center p-4 overflow-hidden">
                <CatCharacter
                  customization={demoCustomization}
                  state={demoState}
                  gender={demoGender}
                  onClick={() => {
                    sounds.playEmotionalMeow(demoState, demoGender);
                    handleStateSelect(demoState === 'happy' ? 'idle' : 'happy');
                  }}
                  size="lg"
                  showShadow={true}
                />
              </div>

              {/* Sex & State Tester Controls */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#9E9284] dark:text-[#7E756B]">
                    GENDER / SEX
                  </span>
                  <div className="flex items-center gap-1 font-mono text-[10px]">
                    <button
                      onClick={() => {
                        sounds.playClick();
                        setDemoGender('female');
                        sounds.playMeow(1.18);
                      }}
                      className={`btn-press px-2 py-0.5 rounded border transition-colors ${
                        demoGender === 'female'
                          ? 'border-[var(--accent)] bg-[#FDF6F2] dark:bg-[#2A1810] text-[var(--accent)] font-semibold'
                          : 'border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#181615] text-[#756A5E] dark:text-[#B5ACA1]'
                      }`}
                    >
                      ♀ BETINA
                    </button>
                    <button
                      onClick={() => {
                        sounds.playClick();
                        setDemoGender('male');
                        sounds.playMeow(0.88);
                      }}
                      className={`btn-press px-2 py-0.5 rounded border transition-colors ${
                        demoGender === 'male'
                          ? 'border-[var(--accent)] bg-[#FDF6F2] dark:bg-[#2A1810] text-[var(--accent)] font-semibold'
                          : 'border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#181615] text-[#756A5E] dark:text-[#B5ACA1]'
                      }`}
                    >
                      ♂ JANTAN
                    </button>
                  </div>
                </div>

                <span className="font-mono text-[10px] uppercase tracking-wider text-[#9E9284] dark:text-[#7E756B] block">
                  SELECT BEHAVIORAL STATE
                </span>
                <div className="grid grid-cols-4 gap-1.5 font-mono text-[10px]">
                  {(['idle', 'happy', 'playing', 'curious'] as PetState[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStateSelect(st)}
                      className={`btn-press py-1.5 rounded border text-center uppercase font-semibold transition-colors ${
                        demoState === st
                          ? 'border-[var(--accent)] bg-[#FDF6F2] dark:bg-[#2A1810] text-[var(--accent)]'
                          : 'border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#181615] text-[#5A5046] dark:text-[#B5ACA1] hover:border-[#C8BFB3]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Bento Grid Architecture Showcase (Strictly Asymmetric, No Generic 3-Column Layout) */}
      <section className="border-t border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FAF8F5] dark:bg-[#161413] py-16 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="text-left max-w-xl">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--accent)] block mb-1">
              ARCHITECTURE & SPECIFICATION
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#141311] dark:text-[#F6F4EE]">
              Sistem backend deterministik tanpa ketergantungan API pihak ketiga.
            </h2>
          </div>

          {/* Asymmetric Bento Grid (2x2 with different span proportions) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-left">
            
            {/* Bento Cell 1 (Span 7 / 12) - State Machine Engine */}
            <div className="md:col-span-7 bento-card p-6 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#9E9284] dark:text-[#7E756B]">
                  MODULE 01
                </span>
                <Activity className="w-4 h-4 text-[var(--accent)]" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight text-[#141311] dark:text-[#F6F4EE] mb-1.5">
                  Finite State Machine Emosional
                </h3>
                <p className="text-xs text-[#5A5046] dark:text-[#B5ACA1] leading-relaxed">
                  Perubahan status kucing tidak diacak tanpa dasar. Status dominan dievaluasi secara berjenjang dari ambang batas rasa takut, rasa lapar, cadangan energi, kebersihan, dan tingkat kepercayaan.
                </p>
              </div>

              {/* State Machine Flowchart Pills */}
              <div className="pt-2 flex flex-wrap gap-2 font-mono text-[10px]">
                <span className="px-2.5 py-1 rounded border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#1E1C1A] text-[#433B33] dark:text-[#B5ACA1]">
                  FEAR &gt; 50 = SCARED / ANGRY
                </span>
                <span className="px-2.5 py-1 rounded border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#1E1C1A] text-[#433B33] dark:text-[#B5ACA1]">
                  HUNGER &gt; 80 = HANGRY
                </span>
                <span className="px-2.5 py-1 rounded border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#1E1C1A] text-[#433B33] dark:text-[#B5ACA1]">
                  ENERGY &lt; 20 = EXHAUSTED
                </span>
                <span className="px-2.5 py-1 rounded border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#1E1C1A] text-[#433B33] dark:text-[#B5ACA1]">
                  AFFECTION &gt; 70 = PURR
                </span>
              </div>
            </div>

            {/* Bento Cell 2 (Span 5 / 12) - Elapsed-Time Server Calculation */}
            <div className="md:col-span-5 bento-card p-6 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#9E9284] dark:text-[#7E756B]">
                  MODULE 02
                </span>
                <Clock className="w-4 h-4 text-[#B88728]" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight text-[#141311] dark:text-[#F6F4EE] mb-1.5">
                  Elapsed-Time Persistence
                </h3>
                <p className="text-xs text-[#5A5046] dark:text-[#B5ACA1] leading-relaxed">
                  Perhitungan waktu berjalan di layer backend Laravel saat pengguna membuka kembali sesi peramban.
                </p>
              </div>

              <div className="p-3 rounded bg-[#F2ECE1] dark:bg-[#0D0C0B] text-[#3D3730] dark:text-[#B5ACA1] font-mono text-[11px] leading-relaxed border border-[#DDD3C4] dark:border-[#2D2A26]">
                <code>
                  $hours = diffInMinutes / 60;<br />
                  $hunger += $hours * 3.5 * $mult;<br />
                  $energy += is_sleeping ? +18.0 : -3.5;
                </code>
              </div>
            </div>

            {/* Bento Cell 3 (Span 5 / 12) - Personality Multipliers */}
            <div className="md:col-span-5 bento-card p-6 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#9E9284] dark:text-[#7E756B]">
                  MODULE 03
                </span>
                <Sliders className="w-4 h-4 text-[#4A7C59]" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight text-[#141311] dark:text-[#F6F4EE] mb-1.5">
                  Pengali Sifat Kepribadian
                </h3>
                <p className="text-xs text-[#5A5046] dark:text-[#B5ACA1] leading-relaxed">
                  5 kepribadian bawaan (Playful, Shy, Lazy, Affectionate, Grumpy) secara matematis mengubah sensitivitas bentakan dan kecepatan membangun trust.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
                <div className="p-2 rounded border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#1E1C1A]">
                  <span className="text-[#9E9284] dark:text-[#7E756B] block">SHY FEAR GAIN</span>
                  <span className="font-semibold text-[#141311] dark:text-[#F6F4EE]">1.6x SENSITIVITY</span>
                </div>
                <div className="p-2 rounded border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#1E1C1A]">
                  <span className="text-[#9E9284] dark:text-[#7E756B] block">LAZY ENERGY DRAIN</span>
                  <span className="font-semibold text-[#141311] dark:text-[#F6F4EE]">0.7x DECAY</span>
                </div>
              </div>
            </div>

            {/* Bento Cell 4 (Span 7 / 12) - Vector SVG Component System */}
            <div className="md:col-span-7 bento-card p-6 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#9E9284] dark:text-[#7E756B]">
                  MODULE 04
                </span>
                <Cpu className="w-4 h-4 text-[#756A5E] dark:text-[#B5ACA1]" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight text-[#141311] dark:text-[#F6F4EE] mb-1.5">
                  Arsitektur Vektor SVG Dinamis
                </h3>
                <p className="text-xs text-[#5A5046] dark:text-[#B5ACA1] leading-relaxed">
                  Karakter dirender via komponen SVG modular terpisah: lapisan tubuh, corak mantel (stripes, tuxedo, calico), morfologi telinga, pigmen iris, dan perhiasan kerah kalung.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-[#5A5046] dark:text-[#B5ACA1] pt-1">
                <span className="px-2 py-1 rounded bg-[#F1EDE5] dark:bg-[#262320] border border-[#E7E2DA] dark:border-[#2D2A26]">SCALE INDEPENDENT</span>
                <span className="px-2 py-1 rounded bg-[#F1EDE5] dark:bg-[#262320] border border-[#E7E2DA] dark:border-[#2D2A26]">0 BITMAP ASSETS</span>
                <span className="px-2 py-1 rounded bg-[#F1EDE5] dark:bg-[#262320] border border-[#E7E2DA] dark:border-[#2D2A26]">FRAMER MOTION</span>
              </div>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
};
