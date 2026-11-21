import React from 'react';
import { CatCustomization, EarStyle, PatternType, AccessoryType } from '../../types/pet';
import { sounds } from '../../audio/soundSynth';

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

const PATTERNS: { label: string; value: PatternType; icon: string }[] = [
  { label: 'Stripes (Tabby)', value: 'stripes', icon: '〰️' },
  { label: 'Tuxedo', value: 'tuxedo', icon: '👔' },
  { label: 'Calico', value: 'calico', icon: '🎨' },
  { label: 'White Socks', value: 'socks', icon: '🧦' },
  { label: 'Solid Coat', value: 'solid', icon: '✨' },
];

const EYE_COLORS = [
  { label: 'Emerald Green', value: '#48BB78' },
  { label: 'Gold Amber', value: '#ECC94B' },
  { label: 'Sapphire Blue', value: '#4299E1' },
  { label: 'Warm Hazel', value: '#ED8936' },
  { label: 'Amethyst Violet', value: '#9F7AEA' },
];

const EAR_STYLES: { label: string; value: EarStyle }[] = [
  { label: 'Tegak (Pointy)', value: 'pointy' },
  { label: 'Lipat (Folded)', value: 'folded' },
  { label: 'Bulat (Round)', value: 'round' },
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

const ACCESSORIES: { label: string; value: AccessoryType; icon: string }[] = [
  { label: 'Tidak Ada', value: 'none', icon: '❌' },
  { label: 'Pita Merah', value: 'bow', icon: '🎀' },
  { label: 'Bunga Daisy', value: 'flower', icon: '🌼' },
  { label: 'Syal Hangat', value: 'scarf', icon: '🧣' },
  { label: 'Kacamata Bulat', value: 'glasses', icon: '👓' },
];

export const CatCustomizer: React.FC<CatCustomizerProps> = ({ customization, onChange }) => {
  const update = (patch: Partial<CatCustomization>) => {
    sounds.playClick();
    onChange({ ...customization, ...patch });
  };

  return (
    <div className="space-y-5 text-sm">
      {/* 1. Warna Bulu */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-brown-600 mb-2">
          1. Warna Bulu Utama
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {FUR_COLORS.map((fur) => (
            <button
              key={fur.value}
              type="button"
              onClick={() => update({ fur_color: fur.value, fur_secondary_color: fur.secondary })}
              className={`p-2 rounded-xl flex flex-col items-center gap-1.5 border transition-all ${
                customization.fur_color === fur.value
                  ? 'border-terracotta-500 bg-terracotta-50 shadow-sm ring-2 ring-terracotta-200'
                  : 'border-cream-300 bg-white hover:border-cream-400'
              }`}
            >
              <div
                className="w-7 h-7 rounded-full shadow-inner border border-black/10"
                style={{ backgroundColor: fur.value }}
              />
              <span className="text-[11px] font-medium text-charcoal-700 truncate w-full text-center">
                {fur.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Corak / Pola Bulu */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-brown-600 mb-2">
          2. Corak / Pola Bulu
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PATTERNS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => update({ pattern: p.value })}
              className={`p-2.5 rounded-xl flex items-center gap-2 border transition-all ${
                customization.pattern === p.value
                  ? 'border-terracotta-500 bg-terracotta-50 shadow-sm ring-2 ring-terracotta-200 font-semibold'
                  : 'border-cream-300 bg-white hover:border-cream-400 font-medium'
              }`}
            >
              <span className="text-base">{p.icon}</span>
              <span className="text-xs text-charcoal-700">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Warna Mata */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-brown-600 mb-2">
          3. Warna Mata
        </label>
        <div className="flex flex-wrap gap-2">
          {EYE_COLORS.map((eye) => (
            <button
              key={eye.value}
              type="button"
              onClick={() => update({ eye_color: eye.value })}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-2 border transition-all ${
                customization.eye_color === eye.value
                  ? 'border-terracotta-500 bg-terracotta-50 shadow-sm ring-2 ring-terracotta-200'
                  : 'border-cream-300 bg-white hover:border-cream-400'
              }`}
            >
              <span
                className="w-4 h-4 rounded-full border border-black/15 shadow-inner"
                style={{ backgroundColor: eye.value }}
              />
              <span className="text-xs font-medium text-charcoal-700">{eye.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Bentuk Telinga */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-brown-600 mb-2">
          4. Bentuk Telinga
        </label>
        <div className="grid grid-cols-3 gap-2">
          {EAR_STYLES.map((ear) => (
            <button
              key={ear.value}
              type="button"
              onClick={() => update({ ear_style: ear.value })}
              className={`py-2 px-3 rounded-xl text-center border text-xs transition-all ${
                customization.ear_style === ear.value
                  ? 'border-terracotta-500 bg-terracotta-50 shadow-sm ring-2 ring-terracotta-200 font-semibold text-terracotta-700'
                  : 'border-cream-300 bg-white hover:border-cream-400 text-charcoal-700'
              }`}
            >
              {ear.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Kalung & Lonceng */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-brown-600">
            5. Kalung & Lonceng
          </label>
          <label className="flex items-center gap-2 text-xs text-charcoal-700 cursor-pointer">
            <input
              type="checkbox"
              checked={customization.bell}
              onChange={(e) => update({ bell: e.target.checked })}
              className="rounded border-cream-400 text-terracotta-500 focus:ring-terracotta-400 w-3.5 h-3.5"
            />
            <span>Gunakan Lonceng Emas 🔔</span>
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          {COLLAR_COLORS.map((col) => (
            <button
              key={col.value}
              type="button"
              onClick={() => update({ collar_color: col.value })}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-2 border transition-all ${
                customization.collar_color === col.value
                  ? 'border-terracotta-500 bg-terracotta-50 shadow-sm ring-2 ring-terracotta-200'
                  : 'border-cream-300 bg-white hover:border-cream-400'
              }`}
            >
              {col.value !== 'none' ? (
                <span
                  className="w-3.5 h-3.5 rounded-full border border-black/15"
                  style={{ backgroundColor: col.value }}
                />
              ) : (
                <span className="text-xs">🚫</span>
              )}
              <span className="text-xs font-medium text-charcoal-700">{col.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 6. Aksesori Tambahan */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-brown-600 mb-2">
          6. Aksesori Tambahan
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ACCESSORIES.map((acc) => (
            <button
              key={acc.value}
              type="button"
              onClick={() => update({ accessory: acc.value })}
              className={`p-2 rounded-xl flex items-center gap-2 border transition-all ${
                customization.accessory === acc.value
                  ? 'border-terracotta-500 bg-terracotta-50 shadow-sm ring-2 ring-terracotta-200 font-semibold'
                  : 'border-cream-300 bg-white hover:border-cream-400'
              }`}
            >
              <span className="text-base">{acc.icon}</span>
              <span className="text-xs text-charcoal-700">{acc.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
