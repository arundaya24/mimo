import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CatCharacter } from '../components/cat/CatCharacter';
import { PetState, CatCustomization } from '../types/pet';
import { Heart, Sparkles, Clock, Feather, ShieldCheck, ArrowRight } from 'lucide-react';
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
  const [clickCount, setClickCount] = useState(0);

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

  const handleDemoCatClick = () => {
    sounds.playMeow();
    const states: PetState[] = ['happy', 'affectionate', 'playing', 'curious'];
    const nextState = states[clickCount % states.length];
    setDemoState(nextState);
    setClickCount((prev) => prev + 1);

    setTimeout(() => {
      setDemoState('idle');
    }, 2200);
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col justify-between paper-texture">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-14 pb-12 flex flex-col lg:flex-row items-center justify-between gap-10">
        
        {/* Left Copy */}
        <div className="flex-1 text-center lg:text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-terracotta-100 border border-terracotta-200 text-terracotta-800 text-xs font-semibold tracking-wide shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-terracotta-500" />
            <span>Digital Pet Companion</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-charcoal-900 leading-[1.15]">
            A little life <br />
            <span className="italic text-terracotta-600 font-normal">to care for.</span>
          </h1>

          <p className="text-base sm:text-lg text-brown-600 max-w-lg leading-relaxed font-normal">
            Beri nama, tentukan kepribadian, dan pelihara seekor kucing digital yang hidup.
            Mimo merasakan kasih sayangmu, mengingat perlakuanmu, dan terus beristirahat meski kamu sedang menutup layar.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
            <button
              onClick={() => {
                sounds.playClick();
                if (isAuthenticated && hasCat) {
                  onStartAdoption(); // In app context, this navigates to dashboard
                } else if (isAuthenticated) {
                  onStartAdoption();
                } else {
                  onOpenLogin();
                }
              }}
              className="tactile-btn w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold text-base flex items-center justify-center gap-2 shadow-sm"
            >
              <span>{isAuthenticated && hasCat ? 'Buka Rumah Kucing' : 'Adopsi Kucing Sekarang'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {!isAuthenticated && (
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenLogin();
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border-2 border-cream-300 hover:border-cream-400 bg-white/80 text-charcoal-700 font-medium text-sm transition-all"
              >
                Sudah Punya Akun? Masuk
              </button>
            )}
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-5 pt-3 text-xs text-brown-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Tersimpan di Cloud
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-honey-600" />
              Simulasi Waktu Riil
            </span>
          </div>
        </div>

        {/* Right Interactive Hero Showcase */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md">
          <div className="relative w-full aspect-square max-w-[340px] rounded-3xl bg-gradient-to-b from-cream-50 to-cream-200 border-2 border-cream-300 shadow-lg flex flex-col items-center justify-center p-6">
            
            {/* Thought speech bubble */}
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="mb-2 bg-white px-3.5 py-1.5 rounded-xl border border-cream-300 shadow-2xs text-xs font-medium text-brown-700 text-center"
            >
              {demoState === 'happy' && 'Purrr... Senang sekali dielus! ✨'}
              {demoState === 'affectionate' && 'Aku sayang kamu... ♥'}
              {demoState === 'playing' && 'Lompaaat tangkap mainan! 🧶'}
              {demoState === 'curious' && 'Ada suara apa itu di sana? 👀'}
              {demoState === 'idle' && 'Klik aku untuk mencobanya! 🐾'}
            </motion.div>

            {/* Interactive SVG Cat */}
            <CatCharacter
              customization={demoCustomization}
              state={demoState}
              onClick={handleDemoCatClick}
              size="lg"
            />

            <div className="mt-4 text-center">
              <span className="text-xs text-brown-500 bg-white/70 px-3 py-1 rounded-full border border-cream-300">
                Tekan tombol atau klik Mimo langsung
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="bg-cream-200/50 border-t border-cream-300 py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-charcoal-900 mb-2">
              Bukan sekadar gambar statis
            </h2>
            <p className="text-sm text-brown-600">
              Dirancang dengan sistem emosi deterministik dan kepribadian mendalam yang bereaksi terhadap cara kamu merawatnya.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="cozy-card p-6 rounded-3xl">
              <div className="w-10 h-10 rounded-2xl bg-terracotta-100 text-terracotta-600 flex items-center justify-center mb-4 text-lg">
                🎨
              </div>
              <h3 className="text-lg font-heading font-semibold text-charcoal-900 mb-2">
                Kustomisasi Sepenuhnya
              </h3>
              <p className="text-xs text-brown-600 leading-relaxed">
                Pilih corak bulu tabby, tuxedo, calico, warna mata zamrud hingga ungu, telinga lipat Scottish Fold, hingga aksesori lonceng dan kacamata.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="cozy-card p-6 rounded-3xl">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 text-lg">
                🧠
              </div>
              <h3 className="text-lg font-heading font-semibold text-charcoal-900 mb-2">
                5 Karakter Unik
              </h3>
              <p className="text-xs text-brown-600 leading-relaxed">
                Kucing Playful butuh banyak main, Shy butuh waktu membangun Trust, Lazy gemar tidur siang, Affectionate haus belaian, dan Grumpy yang gengsi.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="cozy-card p-6 rounded-3xl">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4 text-lg">
                ⏳
              </div>
              <h3 className="text-lg font-heading font-semibold text-charcoal-900 mb-2">
                Simulasi Waktu Backend
              </h3>
              <p className="text-xs text-brown-600 leading-relaxed">
                Tinggalkan website kapan saja. Saat kamu kembali, waktu yang terlewati dihitung oleh server — rasa lapar dan energinya berubah secara realistis.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};
