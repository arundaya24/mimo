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

  init() {
    const saved = localStorage.getItem('mimo_settings');
    if (saved) {
      try {
        this.currentSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {
        this.currentSettings = DEFAULT_SETTINGS;
      }
    }
    this.applySettings(this.currentSettings);
  }

  getSettings(): UserSettings {
    return this.currentSettings;
  }

  applySettings(settings: UserSettings) {
    this.currentSettings = settings;
    localStorage.setItem('mimo_settings', JSON.stringify(settings));

    const root = document.documentElement;

    // 1. Theme (Dark/Light/System)
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System default
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // 2. Accent color
    root.setAttribute('data-accent', settings.accent_color || 'terracotta');

    // 3. UI Scale
    root.setAttribute('data-scale', settings.ui_scale || 'default');

    // 4. Audio settings
    sounds.setMasterVolume((settings.master_volume ?? 80) / 100);
    sounds.setSfxEnabled(Boolean(settings.sfx_enabled));
    sounds.setAmbientEnabled(Boolean(settings.ambient_sound));
  }
}

export const themeManager = new ThemeManager();
