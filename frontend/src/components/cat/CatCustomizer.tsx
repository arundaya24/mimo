import React from 'react';
import { CatCustomization, EarStyle, PatternType, AccessoryType } from '../../types/pet';
import { sounds } from '../../audio/soundSynth';
import { Check } from 'lucide-react';

interface CatCustomizerProps {
  customization: CatCustomization;
  onChange: (updated: CatCustomization) => void;
}

const FUR_COLORS = [
  { label: 'Orange Tabby', value: '#E69A57', secondary: '#FFF8F0' },
  { label: 'Ash Grey', value: '#718096', secondary: '#F7FAFC' },
  { label: 'Snow White', value: '#FFFFFF', secondary: '#F7FAFC' },
  { label: 'Sandy Beige', value: '#D2B48C', secondary: '#FFFDF9' },
  { label: 'Midnight Black', value: '#2D3748', secondary: '#4A5568' },
  { label: 'Golden Brown', value: '#A0522D', secondary: '#FFF5EB' },
];

const PATTERNS: { label: string; value: PatternType; code: string }[] = [
  { label: 'Stripes (Tabby)', value: 'stripes', code: 'PAT-01' },
  { label: 'Tuxedo', value: 'tuxedo', code: 'PAT-02' },
  { label: 'Calico', value: 'calico', code: 'PAT-03' },
  { label: 'White Socks', value: 'socks', code: 'PAT-04' },
  { label: 'Solid Coat', value: 'solid', code: 'PAT-05' },
];

const EYE_COLORS = [
  { label: 'Emerald Green', value: '#48BB78' },
  { label: 'Gold Amber', value: '#ECC94B' },
  { label: 'Sapphire Blue', value: '#4299E1' },
  { label: 'Warm Hazel', value: '#ED8936' },
  { label: 'Amethyst Violet', value: '#9F7AEA' },
];

const EAR_STYLES: { label: string; value: EarStyle; code: string }[] = [
  { label: 'Pointy (Tegak)', value: 'pointy', code: 'EAR-P' },
  { label: 'Folded (Lipat)', value: 'folded', code: 'EAR-F' },
  { label: 'Round (Bulat)', value: 'round', code: 'EAR-R' },
];

const COLLAR_COLORS = [
  { label: 'Terracotta', value: '#D97746' },
  { label: 'Ruby Red', value: '#E53E3E' },
  { label: 'Ocean Blue', value: '#3182CE' },
  { label: 'Forest Green', value: '#38A169' },
  { label: 'Golden Yellow', value: '#D69E2E' },
  { label: 'Deep Purple', value: '#805AD5' },
  { label: 'Tanpa Kalung', value: 'none' },
];

const ACCESSORIES: { label: string; value: AccessoryType; code: string }[] = [
  { label: 'None', value: 'none', code: 'ACC-00' },
  { label: 'Red Bow', value: 'bow', code: 'ACC-01' },
  { label: 'Daisy Flower', value: 'flower', code: 'ACC-02' },
  { label: 'Winter Scarf', value: 'scarf', code: 'ACC-03' },
  { label: 'Round Glasses', value: 'glasses', code: 'ACC-04' },
];

export const CatCustomizer: React.FC<CatCustomizerProps> = ({ customization, onChange }) => {
  const update = (patch: Partial<CatCustomization>) => {
    sounds.playClick();
    onChange({ ...customization, ...patch });
  };

  return (
    <div className="space-y-6 text-left">
      {/* 1. Base Fur Color */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#756A5E] dark:text-[#B5ACA1]">
            01 / WARNA BULU DASAR
          </label>
          <span className="font-mono text-[10px] text-[#9E9284] dark:text-[#7E756B]">
            HEX: {customization.fur_color}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {FUR_COLORS.map((fur) => {
            const isSelected = customization.fur_color === fur.value;
            return (
              <button
                key={fur.value}
                type="button"
                onClick={() => update({ fur_color: fur.value, fur_secondary_color: fur.secondary })}
                className={`btn-press p-2.5 rounded-lg border text-left flex items-center gap-2.5 transition-colors ${
                  isSelected
                    ? 'border-[var(--accent)] bg-[#FDF6F2] dark:bg-[#2A1810]'
                    : 'border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#181615] hover:border-[#C8BFB3] dark:hover:border-[#48433E]'
                }`}
              >
                <div
                  className="w-5 h-5 rounded border border-[#22201D]/15 dark:border-white/20 shrink-0"
                  style={{ backgroundColor: fur.value }}
                />
                <span className="text-xs font-medium text-[#22201D] dark:text-[#F6F4EE] truncate">
                  {fur.label}
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[var(--accent)] ml-auto shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Coat Pattern */}
      <div>
        <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-[#756A5E] dark:text-[#B5ACA1] mb-2">
          02 / POLA BULU
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PATTERNS.map((p) => {
            const isSelected = customization.pattern === p.value;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => update({ pattern: p.value })}
                className={`btn-press p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'border-[var(--accent)] bg-[#FDF6F2] dark:bg-[#2A1810]'
                    : 'border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#181615] hover:border-[#C8BFB3] dark:hover:border-[#48433E]'
                }`}
              >
                <div>
                  <span className="font-mono text-[10px] text-[#9E9284] dark:text-[#7E756B] block">
                    {p.code}
                  </span>
                  <span className="text-xs font-medium text-[#22201D] dark:text-[#F6F4EE]">
                    {p.label}
                  </span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Eye Color */}
      <div>
        <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-[#756A5E] dark:text-[#B5ACA1] mb-2">
          03 / WARNA MATA
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {EYE_COLORS.map((eye) => {
            const isSelected = customization.eye_color === eye.value;
            return (
              <button
                key={eye.value}
                type="button"
                onClick={() => update({ eye_color: eye.value })}
                className={`btn-press p-2.5 rounded-lg border text-left flex items-center gap-2.5 transition-colors ${
                  isSelected
                    ? 'border-[var(--accent)] bg-[#FDF6F2] dark:bg-[#2A1810]'
                    : 'border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#181615] hover:border-[#C8BFB3] dark:hover:border-[#48433E]'
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full border border-[#22201D]/20 dark:border-white/20 shrink-0"
                  style={{ backgroundColor: eye.value }}
                />
                <span className="text-xs font-medium text-[#22201D] dark:text-[#F6F4EE] truncate">
                  {eye.label}
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[var(--accent)] ml-auto shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Ear Style */}
      <div>
        <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-[#756A5E] dark:text-[#B5ACA1] mb-2">
          04 / BENTUK TELINGA
        </label>
        <div className="grid grid-cols-3 gap-2">
          {EAR_STYLES.map((ear) => {
            const isSelected = customization.ear_style === ear.value;
            return (
              <button
                key={ear.value}
                type="button"
                onClick={() => update({ ear_style: ear.value })}
                className={`btn-press p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'border-[var(--accent)] bg-[#FDF6F2] dark:bg-[#2A1810]'
                    : 'border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#181615] hover:border-[#C8BFB3] dark:hover:border-[#48433E]'
                }`}
              >
                <div>
                  <span className="font-mono text-[10px] text-[#9E9284] dark:text-[#7E756B] block">
                    {ear.code}
                  </span>
                  <span className="text-xs font-medium text-[#22201D] dark:text-[#F6F4EE]">
                    {ear.label}
                  </span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Collar & Bell */}
      <div className="space-y-3">
        <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-[#756A5E] dark:text-[#B5ACA1]">
          05 / AKSESORI KALUNG & LONCENG
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {COLLAR_COLORS.map((col) => {
            const isSelected = customization.collar_color === col.value;
            return (
              <button
                key={col.value}
                type="button"
                onClick={() => update({ collar_color: col.value })}
                className={`btn-press p-2 rounded-lg border text-left flex items-center gap-2 transition-colors ${
                  isSelected
                    ? 'border-[var(--accent)] bg-[#FDF6F2] dark:bg-[#2A1810]'
                    : 'border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#181615] hover:border-[#C8BFB3] dark:hover:border-[#48433E]'
                }`}
              >
                {col.value !== 'none' ? (
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10 dark:border-white/10"
                    style={{ backgroundColor: col.value }}
                  />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-dashed border-[#756A5E] shrink-0" />
                )}
                <span className="text-xs font-medium text-[#22201D] dark:text-[#F6F4EE] truncate">
                  {col.label}
                </span>
                {isSelected && <Check className="w-3 h-3 text-[var(--accent)] ml-auto shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Bell Toggle */}
        {customization.collar_color !== 'none' && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => update({ bell: !customization.bell })}
              className={`btn-press flex items-center justify-between w-full p-2.5 rounded-lg border transition-colors ${
                customization.bell
                  ? 'border-[var(--accent)] bg-[#FDF6F2] dark:bg-[#2A1810]'
                  : 'border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#181615]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-medium text-[#22201D] dark:text-[#F6F4EE]">
                  LONCENG EMAS (BELL)
                </span>
              </div>
              <span className={`font-mono text-xs font-bold ${customization.bell ? 'text-[var(--accent)]' : 'text-[#756A5E] dark:text-[#7E756B]'}`}>
                {customization.bell ? 'ENABLED' : 'DISABLED'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* 6. Special Accessories */}
      <div>
        <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-[#756A5E] dark:text-[#B5ACA1] mb-2">
          06 / AKSESORI SPESIAL
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ACCESSORIES.map((acc) => {
            const isSelected = customization.accessory === acc.value;
            return (
              <button
                key={acc.value}
                type="button"
                onClick={() => update({ accessory: acc.value })}
                className={`btn-press p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'border-[var(--accent)] bg-[#FDF6F2] dark:bg-[#2A1810]'
                    : 'border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#181615] hover:border-[#C8BFB3] dark:hover:border-[#48433E]'
                }`}
              >
                <div>
                  <span className="font-mono text-[10px] text-[#9E9284] dark:text-[#7E756B] block">
                    {acc.code}
                  </span>
                  <span className="text-xs font-medium text-[#22201D] dark:text-[#F6F4EE]">
                    {acc.label}
                  </span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
