import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { petService } from '../services/petService';
import { Cat, CatPersonality, CatCustomization, PetState } from '../types/pet';
import { CatCharacter } from '../components/cat/CatCharacter';
import { CatCustomizer } from '../components/cat/CatCustomizer';
import { sounds } from '../audio/soundSynth';
import { ArrowRight, ArrowLeft, Check, ShieldCheck, Sparkles } from 'lucide-react';

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
      setPersonalities([
        { id: 1, name: 'Playful', code: 'playful', description: 'Tingkat energi tinggi, aktif mengejar mainan.', preferred_activity: 'play' },
        { id: 2, name: 'Shy', code: 'shy', description: 'Sensitif terhadap bentakan, butuh waktu membangun trust.', preferred_activity: 'pet' },
        { id: 3, name: 'Lazy', code: 'lazy', description: 'Tingkat kelelahan rendah, preferensi tidur siang.', preferred_activity: 'sleep' },
        { id: 4, name: 'Affectionate', code: 'affectionate', description: 'Membutuhkan interaksi konstan dan elusan.', preferred_activity: 'pet' },
        { id: 5, name: 'Grumpy', code: 'grumpy', description: 'Reaktif terhadap sentuhan mendadak, menyukai camilan.', preferred_activity: 'treat' },
      ]);
    });
  }, []);

  const handleNextStep = () => {
    sounds.playClick();
    if (step === 1) {
      if (!name.trim()) {
        setError('Nama kucing wajib diisi.');
        return;
      }
      setError(null);
      setStep(2);
    } else if (step === 2) {
      setStep(3);
      confetti({
        particleCount: 50,
        spread: 50,
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
        particleCount: 80,
        spread: 60,
        origin: { y: 0.5 },
      });
      sounds.playMeow();
      onAdoptionSuccess(res.cat);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Proses adopsi gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 bg-[#F8F6F1]">
      
      {/* Precision Stepper */}
      <div className="max-w-md mx-auto mb-8 grid grid-cols-3 gap-2 font-mono text-[11px]">
        {[
          { num: 1, code: '01', label: 'IDENTITY' },
          { num: 2, code: '02', label: 'PHENOTYPE' },
          { num: 3, code: '03', label: 'CONFIRM' },
        ].map((s) => (
          <div
            key={s.num}
            className={`p-2 rounded-lg border text-left transition-colors ${
              step === s.num
                ? 'border-[#C75D35] bg-[#FDF6F2] text-[#C75D35]'
                : step > s.num
                ? 'border-[#D5CDC2] bg-[#FCFBF8] text-[#4A7C59]'
                : 'border-[#E7E2DA] bg-[#FAF8F5] text-[#9E9284]'
            }`}
          >
            <span className="block text-[9px] opacity-75">{s.code}</span>
            <span className="font-semibold">{s.label}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="max-w-md mx-auto mb-6 p-3 rounded-lg bg-[#FBF2F0] border border-[#ECC4BD] text-[#A84534] font-mono text-[11px] text-left">
          {error}
        </div>
      )}

      {/* STEP 1: IDENTITY & PERSONALITY */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
          
          <div className="lg:col-span-7 bento-card p-6 sm:p-7 rounded-xl space-y-6">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#C75D35] bg-[#FDF6F2] px-2 py-0.5 rounded border border-[#EBCBBD]">
                STEP 01 // PROFIL
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-[#141311] mt-2">
                Identitas dan Kepribadian
              </h2>
              <p className="text-xs text-[#756A5E] mt-1">
                Tentukan nama, jenis kelamin biologis, dan sifat temperamen dasar.
              </p>
            </div>

            {/* Name Input */}
            <div>
              <label className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-[#756A5E] mb-1.5">
                NAMA KARAKTER
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mimo"
                className="w-full px-3.5 py-2 rounded-lg bg-[#FAF8F5] border border-[#E7E2DA] focus:outline-none focus:border-[#C75D35] text-sm font-semibold text-[#141311]"
              />
            </div>

            {/* Gender Selector (Zero Emojis) */}
            <div>
              <label className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-[#756A5E] mb-1.5">
                JENIS KELAMIN
              </label>
              <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                {[
                  { value: 'female', label: 'FEMALE', code: 'BETINA' },
                  { value: 'male', label: 'MALE', code: 'JANTAN' },
                  { value: 'non-binary', label: 'NEUTRAL', code: 'NETRAL' },
                ].map((g) => {
                  const isSelected = gender === g.value;
                  return (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setGender(g.value);
                      }}
                      className={`btn-press p-2.5 rounded-lg border text-left transition-colors ${
                        isSelected
                          ? 'border-[#C75D35] bg-[#FDF6F2] text-[#C75D35] font-semibold'
                          : 'border-[#E7E2DA] bg-[#FCFBF8] text-[#5A5046] hover:border-[#C8BFB3]'
                      }`}
                    >
                      <span className="block font-semibold">{g.label}</span>
                      <span className="text-[10px] text-[#9E9284]">{g.code}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Personality Selector */}
            <div>
              <label className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-[#756A5E] mb-2">
                PILIH TEMPERAMEN // PERSONALITY MATRIX
              </label>
              <div className="space-y-2">
                {personalities.map((p) => {
                  const isSelected = selectedPersonality === p.code;
                  return (
                    <div
                      key={p.code}
                      onClick={() => {
                        sounds.playClick();
                        setSelectedPersonality(p.code);
                      }}
                      className={`btn-press p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-[#C75D35] bg-[#FDF6F2]'
                          : 'border-[#E7E2DA] bg-[#FCFBF8] hover:border-[#C8BFB3]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-[#141311]">
                          {p.name}
                        </span>
                        <span className="font-mono text-[9px] uppercase px-1.5 py-0.2 rounded bg-[#FAF8F5] border border-[#E7E2DA] text-[#756A5E]">
                          ACTIVITY: {p.preferred_activity}
                        </span>
                      </div>
                      <p className="text-xs text-[#5A5046] leading-relaxed">
                        {p.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E7E2DA]">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="font-mono text-xs text-[#756A5E] hover:text-[#22201D]"
                >
                  BATAL
                </button>
              )}
              <button
                type="button"
                onClick={handleNextStep}
                className="btn-press cta-shimmer ml-auto px-5 py-2.5 rounded-lg bg-[#22201D] hover:bg-[#322F2B] text-[#FCFBF8] font-mono text-xs font-semibold tracking-wider uppercase flex items-center gap-2 border border-[#22201D]"
              >
                <span>LANJUT KE PENAMPILAN</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Sticky Vector Preview */}
          <div className="lg:col-span-5 sticky top-20">
            <div className="bento-card p-5 rounded-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E7E2DA]">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#9E9284]">
                  REAL-TIME PREVIEW
                </span>
                <span className="font-mono text-[10px] text-[#4A7C59]">
                  ACTIVE
                </span>
              </div>
              <div className="w-full h-60 bg-[#F4F0E8] rounded-lg border border-[#E7E2DA] flex items-center justify-center p-4">
                <CatCharacter
                  customization={customization}
                  state="happy"
                  size="lg"
                  onClick={() => sounds.playMeow()}
                />
              </div>
              <div className="pt-2 font-mono text-xs">
                <span className="font-bold text-[#141311] block text-sm">
                  {name || 'UNTITLED'}
                </span>
                <span className="text-[10px] text-[#756A5E] uppercase">
                  {gender} / {selectedPersonality}
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* STEP 2: PHENOTYPE CUSTOMIZATION */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
          
          <div className="lg:col-span-7 bento-card p-6 sm:p-7 rounded-xl space-y-6">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#C75D35] bg-[#FDF6F2] px-2 py-0.5 rounded border border-[#EBCBBD]">
                STEP 02 // PENAMPILAN
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-[#141311] mt-2">
                Kustomisasi Visual {name}
              </h2>
              <p className="text-xs text-[#756A5E] mt-1">
                Atur warna mantel, corak bulu, pigmentasi mata, dan ornamen kalung.
              </p>
            </div>

            <CatCustomizer
              customization={customization}
              onChange={setCustomization}
            />

            {/* Step 2 Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E7E2DA]">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setStep(1);
                }}
                className="btn-press flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E7E2DA] text-xs font-mono text-[#5A5046] hover:border-[#C8BFB3]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>KEMBALI</span>
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                className="btn-press cta-shimmer px-5 py-2.5 rounded-lg bg-[#22201D] hover:bg-[#322F2B] text-[#FCFBF8] font-mono text-xs font-semibold tracking-wider uppercase flex items-center gap-2 border border-[#22201D]"
              >
                <span>VERIFIKASI ADOPSI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Sticky Preview */}
          <div className="lg:col-span-5 sticky top-20">
            <div className="bento-card p-5 rounded-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E7E2DA]">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#9E9284]">
                  PREVIEW STAGE
                </span>
                <div className="flex gap-1 font-mono text-[9px]">
                  {(['idle', 'happy', 'playing', 'sleeping'] as PetState[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        sounds.playClick();
                        setPreviewState(st);
                      }}
                      className={`btn-press px-1.5 py-0.5 rounded border uppercase ${
                        previewState === st
                          ? 'border-[#C75D35] bg-[#FDF6F2] text-[#C75D35]'
                          : 'border-[#E7E2DA] text-[#756A5E]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
              <div className="w-full h-64 bg-[#F4F0E8] rounded-lg border border-[#E7E2DA] flex items-center justify-center p-4">
                <CatCharacter
                  customization={customization}
                  state={previewState}
                  size="xl"
                  onClick={() => sounds.playMeow()}
                />
              </div>
              <div className="font-mono text-[11px] text-[#756A5E] uppercase">
                {customization.pattern} // {customization.ear_style} // {customization.accessory}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* STEP 3: ADOPTION CONFIRMATION (NO EMOJIS, CLEAN ARCHITECTURAL CERTIFICATE) */}
      {step === 3 && (
        <div className="max-w-lg mx-auto text-left">
          <div className="bento-card rounded-xl p-6 sm:p-8 border border-[#E7E2DA] space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-[#E7E2DA]">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#C75D35] block mb-1">
                  OFFICIAL RECORD // REGISTRY
                </span>
                <h2 className="text-xl font-bold tracking-tight text-[#141311]">
                  Sertifikat Registrasi Adopsi
                </h2>
              </div>
              <ShieldCheck className="w-5 h-5 text-[#4A7C59]" />
            </div>

            <div className="w-full h-52 bg-[#F4F0E8] rounded-lg border border-[#E7E2DA] flex items-center justify-center p-4">
              <CatCharacter
                customization={customization}
                state="affectionate"
                size="lg"
                onClick={() => sounds.playPurr()}
              />
            </div>

            {/* Spec breakdown table */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg border border-[#E7E2DA] bg-[#FAF8F5] font-mono text-xs">
              <div>
                <span className="text-[10px] text-[#9E9284] block uppercase">NAMA</span>
                <span className="font-semibold text-[#141311]">{name}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#9E9284] block uppercase">TEMPERAMEN</span>
                <span className="font-semibold text-[#C75D35] uppercase">{selectedPersonality}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#9E9284] block uppercase">GENDER</span>
                <span className="font-semibold text-[#141311] uppercase">{gender}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#9E9284] block uppercase">STARTER INVENTORY</span>
                <span className="font-semibold text-[#4A7C59]">10x KIBBLE + 3x TUNA</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setStep(2);
                }}
                className="btn-press flex-1 py-2.5 rounded-lg border border-[#E7E2DA] font-mono text-xs font-semibold text-[#5A5046] hover:border-[#C8BFB3]"
              >
                EDIT KEMBALI
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleFinishAdoption}
                className="btn-press cta-shimmer flex-2 py-2.5 rounded-lg bg-[#22201D] hover:bg-[#322F2B] disabled:opacity-60 text-[#FCFBF8] font-mono text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 border border-[#22201D]"
              >
                <span>{loading ? 'MENYIMPAN DATA...' : 'RESMIKAN ADOPSI'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
