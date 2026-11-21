import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { petService } from '../services/petService';
import { Cat, CatPersonality, CatCustomization, PetState } from '../types/pet';
import { CatCharacter } from '../components/cat/CatCharacter';
import { CatCustomizer } from '../components/cat/CatCustomizer';
import { sounds } from '../audio/soundSynth';
import { Heart, Sparkles, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface AdoptionPageProps {
  onAdoptionSuccess: (cat: Cat) => void;
  onCancel?: () => void;
}

export const AdoptionPage: React.FC<AdoptionPageProps> = ({ onAdoptionSuccess, onCancel }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [personalities, setPersonalities] = useState<CatPersonality[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('Mimo');
  const [gender, setGender] = useState('female');
  const [selectedPersonality, setSelectedPersonality] = useState('playful');

  const [customization, setCustomization] = useState<CatCustomization>({
    fur_color: '#E69A57',
    fur_secondary_color: '#FFF8F0',
    pattern: 'stripes',
    pattern_color: '#A0522D',
    eye_color: '#48BB78',
    ear_style: 'pointy',
    collar_color: '#D97746',
    bell: true,
    accessory: 'none',
  });

  const [previewState, setPreviewState] = useState<PetState>('idle');

  useEffect(() => {
    petService.getPersonalities().then((data) => {
      setPersonalities(data);
      if (data.length > 0 && !selectedPersonality) {
        setSelectedPersonality(data[0].code);
      }
    }).catch(() => {
      // Fallback personalities if offline
      setPersonalities([
        { id: 1, name: 'Playful', code: 'playful', description: 'Penuh energi, selalu ingin tahu, dan suka mengejar mainan.', preferred_activity: 'play' },
        { id: 2, name: 'Shy', code: 'shy', description: 'Pemalu dan sensitif. Butuh waktu untuk membangun Trust.', preferred_activity: 'pet' },
        { id: 3, name: 'Lazy', code: 'lazy', description: 'Sangat santai, gemar rebahan di titik hangat matahari.', preferred_activity: 'sleep' },
        { id: 4, name: 'Affectionate', code: 'affectionate', description: 'Manja, suka dielus, dan sering mendengkur hangat.', preferred_activity: 'pet' },
        { id: 5, name: 'Grumpy', code: 'grumpy', description: 'Berwajah judes, gengsi tinggi, tapi setia.', preferred_activity: 'treat' },
      ]);
    });
  }, []);

  const handleNextStep = () => {
    sounds.playClick();
    if (step === 1) {
      if (!name.trim()) {
        setError('Berikan nama yang manis untuk kucingmu.');
        return;
      }
      setError(null);
      setStep(2);
    } else if (step === 2) {
      setStep(3);
      // Trigger festive adoption confetti!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
      sounds.playPurr();
    }
  };

  const handleFinishAdoption = async () => {
    setLoading(true);
    setError(null);
    sounds.playClick();

    try {
      const res = await petService.adoptCat({
        name: name.trim(),
        gender,
        personality_code: selectedPersonality,
        fur_color: customization.fur_color,
        fur_secondary_color: customization.fur_secondary_color,
        pattern: customization.pattern,
        pattern_color: customization.pattern_color,
        eye_color: customization.eye_color,
        ear_style: customization.ear_style,
        collar_color: customization.collar_color,
        bell: customization.bell,
        accessory: customization.accessory,
      });

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
      });
      sounds.playMeow();
      onAdoptionSuccess(res.cat);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memproses adopsi kucing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 paper-texture">
      {/* Top Stepper Indicator */}
      <div className="flex items-center justify-between max-w-md mx-auto mb-8">
        {[
          { num: 1, label: 'Nama & Karakter' },
          { num: 2, label: 'Penampilan' },
          { num: 3, label: 'Sertifikat Adopsi' },
        ].map((s, idx) => (
          <React.Fragment key={s.num}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs transition-all ${
                  step === s.num
                    ? 'bg-terracotta-500 text-white shadow-sm ring-4 ring-terracotta-100'
                    : step > s.num
                    ? 'bg-emerald-500 text-white'
                    : 'bg-cream-300 text-brown-500'
                }`}
              >
                {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
              </div>
              <span className="text-[11px] font-medium text-brown-600 hidden sm:block">
                {s.label}
              </span>
            </div>
            {idx < 2 && (
              <div
                className={`flex-1 h-0.5 mx-2 -mt-4 transition-all ${
                  step > idx + 1 ? 'bg-emerald-500' : 'bg-cream-300'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {error && (
        <div className="max-w-lg mx-auto mb-6 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center">
          {error}
        </div>
      )}

      {/* STEP 1: IDENTITY & PERSONALITY */}
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Form left */}
          <div className="md:col-span-7 bg-white/95 rounded-3xl border-2 border-cream-300 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-2xl font-heading font-bold text-charcoal-900">
                Pilih Teman Hidupmu
              </h2>
              <p className="text-xs text-brown-500 mt-1">
                Setiap kucing memiliki nama dan jiwa kepribadian yang berbeda.
              </p>
            </div>

            {/* Cat Name Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brown-600 mb-1.5">
                Nama Kucing
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Misal: Mimo, Luna, Ciki, Boba"
                className="w-full px-4 py-3 rounded-2xl bg-cream-50 border border-cream-300 focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-sm font-semibold text-charcoal-800"
              />
            </div>

            {/* Gender Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brown-600 mb-1.5">
                Jenis Kelamin
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'female', label: 'Betina (Female)', icon: '🌸' },
                  { value: 'male', label: 'Jantan (Male)', icon: '🌿' },
                  { value: 'non-binary', label: 'Netral', icon: '✨' },
                ].map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setGender(g.value);
                    }}
                    className={`p-2.5 rounded-2xl border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                      gender === g.value
                        ? 'border-terracotta-500 bg-terracotta-50 shadow-2xs text-terracotta-700 font-semibold ring-2 ring-terracotta-200'
                        : 'border-cream-300 bg-white hover:border-cream-400 text-charcoal-700'
                    }`}
                  >
                    <span>{g.icon}</span>
                    <span>{g.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Personality Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brown-600 mb-2">
                Pilih Kepribadian
              </label>
              <div className="space-y-2.5">
                {personalities.map((p) => (
                  <div
                    key={p.code}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedPersonality(p.code);
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      selectedPersonality === p.code
                        ? 'border-terracotta-500 bg-terracotta-50 shadow-2xs ring-2 ring-terracotta-200'
                        : 'border-cream-300 bg-white hover:border-cream-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-sm text-charcoal-900">
                          {p.name}
                        </span>
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-cream-200 text-brown-600">
                          Aktivitas: {p.preferred_activity}
                        </span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedPersonality === p.code
                            ? 'border-terracotta-500 bg-terracotta-500'
                            : 'border-cream-400'
                        }`}
                      >
                        {selectedPersonality === p.code && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-brown-600 leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 1 Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-cream-200">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2.5 text-xs text-brown-500 hover:text-charcoal-800"
                >
                  Batal
                </button>
              )}
              <button
                type="button"
                onClick={handleNextStep}
                className="tactile-btn ml-auto px-6 py-3 rounded-2xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold text-xs sm:text-sm flex items-center gap-2"
              >
                <span>Lanjut ke Penampilan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Live Preview right */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="w-full bg-white/90 rounded-3xl border-2 border-cream-300 p-6 shadow-sm flex flex-col items-center justify-center sticky top-24">
              <span className="text-xs uppercase font-semibold tracking-wider text-brown-400 mb-2">
                Pratinjau Kucing
              </span>
              <div className="w-full flex items-center justify-center h-64">
                <CatCharacter
                  customization={customization}
                  state="happy"
                  size="xl"
                  onClick={() => sounds.playMeow()}
                />
              </div>
              <div className="text-center mt-2">
                <span className="font-heading font-bold text-lg text-charcoal-800">
                  {name || 'Nama Kucing'}
                </span>
                <p className="text-xs text-brown-500 capitalize">
                  {gender} • {selectedPersonality}
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* STEP 2: APPEARANCE CUSTOMIZATION */}
      {step === 2 && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Customizer Controls left */}
          <div className="md:col-span-7 bg-white/95 rounded-3xl border-2 border-cream-300 p-6 sm:p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-heading font-bold text-charcoal-900">
                Atur Penampilan {name}
              </h2>
              <p className="text-xs text-brown-500 mt-1">
                Kustomisasi warna bulu, corak belang, mata zamrud, telinga, dan perhiasan lonceng.
              </p>
            </div>

            <CatCustomizer
              customization={customization}
              onChange={setCustomization}
            />

            {/* Step 2 Actions */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-cream-200">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setStep(1);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-cream-300 text-xs text-brown-600 hover:bg-cream-100"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                className="tactile-btn px-6 py-3 rounded-2xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold text-xs sm:text-sm flex items-center gap-2"
              >
                <span>Lihat Sertifikat Adopsi</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sticky Live Preview right */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="w-full bg-white/90 rounded-3xl border-2 border-cream-300 p-6 shadow-sm flex flex-col items-center justify-center sticky top-24">
              <span className="text-xs uppercase font-semibold tracking-wider text-brown-400 mb-2">
                Pratinjau Langsung
              </span>

              {/* State Preview Pill Toggles */}
              <div className="flex flex-wrap gap-1 mb-3 justify-center">
                {(['idle', 'happy', 'playing', 'sleeping', 'affectionate'] as PetState[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      sounds.playClick();
                      setPreviewState(st);
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all ${
                      previewState === st
                        ? 'bg-terracotta-500 text-white'
                        : 'bg-cream-200 text-brown-600 hover:bg-cream-300'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="w-full flex items-center justify-center h-64">
                <CatCharacter
                  customization={customization}
                  state={previewState}
                  size="xl"
                  onClick={() => sounds.playMeow()}
                />
              </div>

              <div className="text-center mt-2">
                <span className="font-heading font-bold text-xl text-charcoal-900">
                  {name}
                </span>
                <p className="text-xs text-brown-500">
                  {customization.pattern} • Telinga {customization.ear_style}
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* STEP 3: ADOPTION CERTIFICATE & CONFIRMATION */}
      {step === 3 && (
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-3xl border-4 border-amber-200 shadow-xl p-8 relative overflow-hidden text-center">
            
            {/* Watermark Paw */}
            <div className="absolute -top-10 -right-10 text-9xl text-amber-50 pointer-events-none select-none">
              🐾
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-honey-100 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-4 border border-honey-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Official Adoption Certificate
            </div>

            <h2 className="text-3xl font-heading font-bold text-charcoal-900 mb-2">
              Sertifikat Adopsi MIMO
            </h2>
            <p className="text-xs text-brown-500 mb-6">
              Dengan ini kamu berjanji menyayangi, memberi makan, dan merawat:
            </p>

            <div className="w-full flex items-center justify-center my-4">
              <CatCharacter
                customization={customization}
                state="affectionate"
                size="xl"
                onClick={() => sounds.playPurr()}
              />
            </div>

            <div className="bg-cream-100/80 rounded-2xl p-4 border border-cream-300 mb-6 grid grid-cols-2 gap-3 text-left">
              <div>
                <span className="text-[10px] uppercase font-semibold text-brown-400">Nama</span>
                <p className="font-heading font-bold text-lg text-charcoal-900">{name}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-brown-400">Kepribadian</span>
                <p className="font-heading font-bold text-base text-terracotta-600 capitalize">
                  {selectedPersonality}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-brown-400">Jenis Kelamin</span>
                <p className="text-xs font-medium text-charcoal-800 capitalize">{gender}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-brown-400">Paket Pemula</span>
                <p className="text-xs font-medium text-emerald-700">10x Kibble + 3x Tuna + Mainan</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setStep(2);
                }}
                className="flex-1 py-3 rounded-2xl border border-cream-300 text-xs font-semibold text-brown-600 hover:bg-cream-100 transition-colors"
              >
                Ubah Lagi
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleFinishAdoption}
                className="tactile-btn flex-2 py-3.5 rounded-2xl bg-terracotta-500 hover:bg-terracotta-600 disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>{loading ? 'Menyiapkan Rumah...' : 'Resmikan & Bawa Pulang'}</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
