import { UserSettings } from '../types/pet';
import { sounds } from '../audio/soundSynth';

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  accent_color: 'terracotta',
  ui_scale: 'default',
  master_volume: 80,
  sfx_enabled: true,
  ambient_sound: false,
  notifications: true,
  feeding_reminder: true,
  activity_simulation: true,
};

class ThemeManager {
  private currentSettings: UserSettings = DEFAULT_SETTINGS;
  private mediaQueryListenerAttached = false;

  init() {
    const saved = localStorage.getItem('mimo_settings');
    if (saved) {
      try {
        this.currentSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {
        this.currentSettings = DEFAULT_SETTINGS;
      }
    }

    if (!this.mediaQueryListenerAttached && typeof window !== 'undefined' && window.matchMedia) {
      this.mediaQueryListenerAttached = true;
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.currentSettings.theme === 'system') {
          this.applySettings(this.currentSettings);
        }
      });
    }

    this.applySettings(this.currentSettings);
  }

  getSettings(): UserSettings {
    return this.currentSettings;
  }

  isDark(): boolean {
    if (typeof document === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  }

  subscribe(callback: (settings: UserSettings, isDark: boolean) => void): () => void {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ settings: UserSettings; isDark: boolean }>;
      callback(ce.detail.settings, ce.detail.isDark);
    };
    window.addEventListener('mimo-theme-changed', handler);
    return () => window.removeEventListener('mimo-theme-changed', handler);
  }

  applySettings(settings: UserSettings) {
    this.currentSettings = settings;
    localStorage.setItem('mimo_settings', JSON.stringify(settings));

    const root = document.documentElement;

    // 1. Theme (Dark/Light/System)
    let isDark = false;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      isDark = true;
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
      isDark = false;
    } else {
      // System default
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
        isDark = true;
      } else {
        root.classList.remove('dark');
        isDark = false;
      }
    }

    // Set data-theme attribute
    root.setAttribute('data-theme', settings.theme || 'system');

    // 2. Accent color
    root.setAttribute('data-accent', settings.accent_color || 'terracotta');

    // 3. UI Scale
    root.setAttribute('data-scale', settings.ui_scale || 'default');

    // 4. Audio settings
    sounds.setMasterVolume((settings.master_volume ?? 80) / 100);
    sounds.setSfxEnabled(Boolean(settings.sfx_enabled));
    sounds.setAmbientEnabled(Boolean(settings.ambient_sound));

    // Dispatch custom event to notify all components reactive to theme changes
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('mimo-theme-changed', {
          detail: { settings, isDark },
        })
      );
    }
  }
}

export const themeManager = new ThemeManager();
