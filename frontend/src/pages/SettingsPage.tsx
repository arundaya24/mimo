import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, UserSettings } from '../types/pet';
import { authService } from '../services/authService';
import { themeManager, DEFAULT_SETTINGS } from '../services/themeManager';
import { sounds } from '../audio/soundSynth';
import {
  Sun,
  Moon,
  Laptop,
  Volume2,
  VolumeX,
  Bell,
  Clock,
  Sparkles,
  User as UserIcon,
  KeyRound,
  Trash2,
  Check,
  AlertTriangle,
  X,
  Sliders,
  ShieldCheck,
  Radio
} from 'lucide-react';

interface SettingsPageProps {
  user: User | null;
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
  onBack: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  user,
  onUpdateUser,
  onLogout,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'appearance' | 'sound' | 'gameplay' | 'account'>('appearance');
  const [settings, setSettings] = useState<UserSettings>(themeManager.getSettings());
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Profile Form
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [displayEmail, setDisplayEmail] = useState(user?.email || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Delete Account Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    // Sync settings from server if user is logged in
    if (user) {
      authService.getSettings().then((srvSettings) => {
        const merged = { ...DEFAULT_SETTINGS, ...srvSettings };
        setSettings(merged);
        themeManager.applySettings(merged);
      }).catch(() => {});
    }
  }, [user]);

  const updateSettingField = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    sounds.playClick();
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    themeManager.applySettings(updated);

    // Persist to server if logged in
    if (user) {
      authService.updateSettings({ [key]: value }).catch(() => {});
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    setIsUpdatingProfile(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const res = await authService.updateProfile(displayName, displayEmail);
      onUpdateUser(res.user);
      setSaveSuccess('Profil operator berhasil diperbarui.');
      setTimeout(() => setSaveSuccess(null), 3500);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Gagal memperbarui profil.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();

    if (newPassword !== confirmPassword) {
      setSaveError('Konfirmasi password tidak cocok.');
      return;
    }

    setIsUpdatingPassword(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      await authService.updatePassword(currentPassword, newPassword, confirmPassword);
      setSaveSuccess('Password berhasil diperbarui.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSaveSuccess(null), 3500);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Gagal mengubah password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    sounds.playClick();
    setIsDeletingAccount(true);
    setSaveError(null);

    try {
      await authService.deleteAccount(deletePassword);
      setShowDeleteModal(false);
      onLogout();
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Gagal menghapus akun.');
      setIsDeletingAccount(false);
    }
  };

  const accentOptions = [
    { id: 'terracotta', label: 'TERRACOTTA', hex: '#C75D35' },
    { id: 'sage', label: 'SAGE', hex: '#4A7C59' },
    { id: 'amber', label: 'AMBER', hex: '#D97706' },
    { id: 'slate', label: 'SLATE', hex: '#475569' },
    { id: 'rose', label: 'ROSE', hex: '#E11D48' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 text-left">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E7E2DA] dark:border-[#2D2A26]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#9E9284] dark:text-[#7E756B]">
              CONFIGURATION SYSTEM
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#22201D] dark:text-[#F6F4EE]">
            Pengaturan Sistem
          </h1>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            onBack();
          }}
          className="btn-press px-4 py-2 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#181615] text-[#22201D] dark:text-[#F6F4EE] font-mono text-xs font-semibold hover:border-[#C8BFB3] dark:hover:border-[#48433E]"
        >
          KEMBALI KE BERANDA
        </button>
      </div>

      {/* Toast Feedback */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="p-3 rounded-lg border border-emerald-800/40 bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-mono text-xs flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-500" />
            <span>{saveSuccess}</span>
          </motion.div>
        )}

        {saveError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="p-3 rounded-lg border border-rose-800/40 bg-rose-950/20 text-rose-600 dark:text-rose-400 font-mono text-xs flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span>{saveError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Navigation Navigation Bar */}
      <div className="flex items-center gap-1 p-1 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FAF8F5] dark:bg-[#1E1C1A] overflow-x-auto">
        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('appearance');
          }}
          className={`btn-press flex-1 min-w-[120px] py-2 px-3 rounded-md font-mono text-xs font-medium transition-colors ${
            activeTab === 'appearance'
              ? 'bg-[#FCFBF8] dark:bg-[#181615] text-[#22201D] dark:text-[#F6F4EE] border border-[#E7E2DA] dark:border-[#2D2A26] font-semibold'
              : 'text-[#756A5E] dark:text-[#B5ACA1] hover:text-[#22201D] dark:hover:text-[#F6F4EE]'
          }`}
        >
          01 // APPEARANCE
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('sound');
          }}
          className={`btn-press flex-1 min-w-[120px] py-2 px-3 rounded-md font-mono text-xs font-medium transition-colors ${
            activeTab === 'sound'
              ? 'bg-[#FCFBF8] dark:bg-[#181615] text-[#22201D] dark:text-[#F6F4EE] border border-[#E7E2DA] dark:border-[#2D2A26] font-semibold'
              : 'text-[#756A5E] dark:text-[#B5ACA1] hover:text-[#22201D] dark:hover:text-[#F6F4EE]'
          }`}
        >
          02 // SOUND
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('gameplay');
          }}
          className={`btn-press flex-1 min-w-[120px] py-2 px-3 rounded-md font-mono text-xs font-medium transition-colors ${
            activeTab === 'gameplay'
              ? 'bg-[#FCFBF8] dark:bg-[#181615] text-[#22201D] dark:text-[#F6F4EE] border border-[#E7E2DA] dark:border-[#2D2A26] font-semibold'
              : 'text-[#756A5E] dark:text-[#B5ACA1] hover:text-[#22201D] dark:hover:text-[#F6F4EE]'
          }`}
        >
          03 // GAMEPLAY
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('account');
          }}
          className={`btn-press flex-1 min-w-[120px] py-2 px-3 rounded-md font-mono text-xs font-medium transition-colors ${
            activeTab === 'account'
              ? 'bg-[#FCFBF8] dark:bg-[#181615] text-[#22201D] dark:text-[#F6F4EE] border border-[#E7E2DA] dark:border-[#2D2A26] font-semibold'
              : 'text-[#756A5E] dark:text-[#B5ACA1] hover:text-[#22201D] dark:hover:text-[#F6F4EE]'
          }`}
        >
          04 // ACCOUNT
        </button>
      </div>

      {/* ================= TAB 1: APPEARANCE ================= */}
      {activeTab === 'appearance' && (
        <div className="space-y-6">
          {/* Theme Selector */}
          <div className="bento-card rounded-xl p-5 space-y-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#9E9284] dark:text-[#7E756B]">
                THEME PROTOCOL
              </span>
              <h3 className="text-base font-bold text-[#22201D] dark:text-[#F6F4EE]">
                Mode Tampilan
              </h3>
              <p className="text-xs text-[#756A5E] dark:text-[#B5ACA1] mt-0.5">
                Pilih tema pencahayaan visual antarmuka. Tersimpan permanen di perangkat.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'light', label: 'LIGHT MODE', icon: Sun, desc: 'Warm cream & dark charcoal' },
                { id: 'dark', label: 'DARK MODE', icon: Moon, desc: 'Onyx charcoal & soft cream' },
                { id: 'system', label: 'SYSTEM DEFAULT', icon: Laptop, desc: 'Mengikuti preferensi OS' },
              ].map((theme) => {
                const Icon = theme.icon;
                const isSelected = settings.theme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => updateSettingField('theme', theme.id as any)}
                    className={`btn-press p-4 rounded-lg border text-left flex flex-col justify-between h-28 transition-colors ${
                      isSelected
                        ? 'border-[var(--accent)] bg-[var(--bg-subtle)]'
                        : 'border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#181615] hover:border-[#C8BFB3] dark:hover:border-[#48433E]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-[var(--accent)]' : 'text-[#756A5E] dark:text-[#B5ACA1]'}`} />
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />}
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold text-[#22201D] dark:text-[#F6F4EE] block">
                        {theme.label}
                      </span>
                      <span className="text-[11px] text-[#756A5E] dark:text-[#B5ACA1]">
                        {theme.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accent Color Selector */}
          <div className="bento-card rounded-xl p-5 space-y-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#9E9284] dark:text-[#7E756B]">
                COLOR PALETTE
              </span>
              <h3 className="text-base font-bold text-[#22201D] dark:text-[#F6F4EE]">
                Warna Aksen
              </h3>
              <p className="text-xs text-[#756A5E] dark:text-[#B5ACA1] mt-0.5">
                Menyesuaikan warna sorotan tombol, status indikator, dan telemetry badge.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {accentOptions.map((opt) => {
                const isSelected = settings.accent_color === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => updateSettingField('accent_color', opt.id as any)}
                    className={`btn-press flex items-center gap-2.5 px-3.5 py-2 rounded-lg border transition-colors ${
                      isSelected
                        ? 'border-[#22201D] dark:border-[#F6F4EE] bg-[#FAF8F5] dark:bg-[#1E1C1A]'
                        : 'border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#181615] hover:border-[#C8BFB3]'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 dark:border-white/10"
                      style={{ backgroundColor: opt.hex }}
                    />
                    <span className="font-mono text-xs font-medium text-[#22201D] dark:text-[#F6F4EE]">
                      {opt.label}
                    </span>
                    {isSelected && <Check className="w-3 h-3 text-[#22201D] dark:text-[#F6F4EE]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interface Scale */}
          <div className="bento-card rounded-xl p-5 space-y-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#9E9284] dark:text-[#7E756B]">
                TYPOGRAPHY SCALE
              </span>
              <h3 className="text-base font-bold text-[#22201D] dark:text-[#F6F4EE]">
                Ukuran Antarmuka
              </h3>
              <p className="text-xs text-[#756A5E] dark:text-[#B5ACA1] mt-0.5">
                Menyesuaikan proporsi keterbacaan teks dan elemen kontrol.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'compact', label: 'COMPACT', desc: '15px base / Informasi lebih padat' },
                { id: 'default', label: 'DEFAULT', desc: '16px base / Keseimbangan standar' },
                { id: 'comfortable', label: 'COMFORTABLE', desc: '17px base / Teks lebih leluasa' },
              ].map((scale) => {
                const isSelected = settings.ui_scale === scale.id;
                return (
                  <button
                    key={scale.id}
                    onClick={() => updateSettingField('ui_scale', scale.id as any)}
                    className={`btn-press p-3.5 rounded-lg border text-left transition-colors ${
                      isSelected
                        ? 'border-[var(--accent)] bg-[var(--bg-subtle)]'
                        : 'border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#181615] hover:border-[#C8BFB3]'
                    }`}
                  >
                    <span className="font-mono text-xs font-bold text-[#22201D] dark:text-[#F6F4EE] block">
                      {scale.label}
                    </span>
                    <span className="text-[11px] text-[#756A5E] dark:text-[#B5ACA1]">
                      {scale.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: SOUND ================= */}
      {activeTab === 'sound' && (
        <div className="space-y-6">
          <div className="bento-card rounded-xl p-5 space-y-5">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#9E9284] dark:text-[#7E756B]">
                SYNTHESIZER CORE
              </span>
              <h3 className="text-base font-bold text-[#22201D] dark:text-[#F6F4EE]">
                Pengaturan Audio
              </h3>
              <p className="text-xs text-[#756A5E] dark:text-[#B5ACA1] mt-0.5">
                Semua suara disintesis langsung menggunakan Web Audio API tanpa latensi jaringan.
              </p>
            </div>

            {/* Master Volume Slider */}
            <div className="space-y-2 p-4 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FAF8F5] dark:bg-[#1E1C1A]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-[#22201D] dark:text-[#F6F4EE]">
                  MASTER VOLUME
                </span>
                <span className="font-mono text-xs font-bold text-[var(--accent)]">
                  {settings.master_volume}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.master_volume}
                onChange={(e) => updateSettingField('master_volume', parseInt(e.target.value, 10))}
                className="w-full accent-[var(--accent)] cursor-pointer"
              />
            </div>

            {/* SFX Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FAF8F5] dark:bg-[#1E1C1A]">
              <div>
                <span className="font-mono text-xs font-semibold text-[#22201D] dark:text-[#F6F4EE] block">
                  EFEK SUARA (SFX)
                </span>
                <span className="text-[11px] text-[#756A5E] dark:text-[#B5ACA1]">
                  Meow, dengkuran (purr), kunyahan makanan, dan klik interaksi tombol.
                </span>
              </div>
              <button
                onClick={() => updateSettingField('sfx_enabled', !settings.sfx_enabled)}
                className={`btn-press px-4 py-1.5 rounded-lg font-mono text-xs font-bold border transition-colors ${
                  settings.sfx_enabled
                    ? 'bg-[#22201D] dark:bg-[#F6F4EE] text-[#F8F6F1] dark:text-[#121110] border-[#22201D] dark:border-[#F6F4EE]'
                    : 'bg-[#FCFBF8] dark:bg-[#181615] text-[#756A5E] dark:text-[#7E756B] border-[#E7E2DA] dark:border-[#2D2A26]'
                }`}
              >
                {settings.sfx_enabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Ambient Sound Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FAF8F5] dark:bg-[#1E1C1A]">
              <div>
                <span className="font-mono text-xs font-semibold text-[#22201D] dark:text-[#F6F4EE] block">
                  SUASANA AMBIEN RUANGAN (AMBIENT SOUND)
                </span>
                <span className="text-[11px] text-[#756A5E] dark:text-[#B5ACA1]">
                  Resonansi dengkur halus berfrekuensi rendah yang menenangkan di latar belakang.
                </span>
              </div>
              <button
                onClick={() => updateSettingField('ambient_sound', !settings.ambient_sound)}
                className={`btn-press px-4 py-1.5 rounded-lg font-mono text-xs font-bold border transition-colors ${
                  settings.ambient_sound
                    ? 'bg-[#22201D] dark:bg-[#F6F4EE] text-[#F8F6F1] dark:text-[#121110] border-[#22201D] dark:border-[#F6F4EE]'
                    : 'bg-[#FCFBF8] dark:bg-[#181615] text-[#756A5E] dark:text-[#7E756B] border-[#E7E2DA] dark:border-[#2D2A26]'
                }`}
              >
                {settings.ambient_sound ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Test Audio Button */}
            <div className="pt-2">
              <button
                onClick={() => {
                  sounds.playMeow();
                }}
                className="btn-press px-4 py-2 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#181615] font-mono text-xs font-semibold text-[#22201D] dark:text-[#F6F4EE] hover:border-[#C8BFB3]"
              >
                UJI SUARA MEOW
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: GAMEPLAY ================= */}
      {activeTab === 'gameplay' && (
        <div className="space-y-6">
          <div className="bento-card rounded-xl p-5 space-y-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#9E9284] dark:text-[#7E756B]">
                SIMULATION BEHAVIOR
              </span>
              <h3 className="text-base font-bold text-[#22201D] dark:text-[#F6F4EE]">
                Logika Simulasi & Pengingat
              </h3>
              <p className="text-xs text-[#756A5E] dark:text-[#B5ACA1] mt-0.5">
                Konfigurasi mekanisme simulasi metabolisme dan kebiasaan kucing.
              </p>
            </div>

            {/* Activity Simulation */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FAF8F5] dark:bg-[#1E1C1A]">
              <div>
                <span className="font-mono text-xs font-semibold text-[#22201D] dark:text-[#F6F4EE] block">
                  SIMULASI PERILAKU OTONOM
                </span>
                <span className="text-[11px] text-[#756A5E] dark:text-[#B5ACA1]">
                  Kucing berpindah posisi, mendekati mangkok makan, atau beristirahat secara mandiri.
                </span>
              </div>
              <button
                onClick={() => updateSettingField('activity_simulation', !settings.activity_simulation)}
                className={`btn-press px-4 py-1.5 rounded-lg font-mono text-xs font-bold border transition-colors ${
                  settings.activity_simulation
                    ? 'bg-[#22201D] dark:bg-[#F6F4EE] text-[#F8F6F1] dark:text-[#121110] border-[#22201D] dark:border-[#F6F4EE]'
                    : 'bg-[#FCFBF8] dark:bg-[#181615] text-[#756A5E] dark:text-[#7E756B] border-[#E7E2DA] dark:border-[#2D2A26]'
                }`}
              >
                {settings.activity_simulation ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Feeding Reminder */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FAF8F5] dark:bg-[#1E1C1A]">
              <div>
                <span className="font-mono text-xs font-semibold text-[#22201D] dark:text-[#F6F4EE] block">
                  PENGINGAT RUTIN PEMBERIAN PAKAN
                </span>
                <span className="text-[11px] text-[#756A5E] dark:text-[#B5ACA1]">
                  Menampilkan indikator visual saat tingkat lapar kucing mencapai di atas 70%.
                </span>
              </div>
              <button
                onClick={() => updateSettingField('feeding_reminder', !settings.feeding_reminder)}
                className={`btn-press px-4 py-1.5 rounded-lg font-mono text-xs font-bold border transition-colors ${
                  settings.feeding_reminder
                    ? 'bg-[#22201D] dark:bg-[#F6F4EE] text-[#F8F6F1] dark:text-[#121110] border-[#22201D] dark:border-[#F6F4EE]'
                    : 'bg-[#FCFBF8] dark:bg-[#181615] text-[#756A5E] dark:text-[#7E756B] border-[#E7E2DA] dark:border-[#2D2A26]'
                }`}
              >
                {settings.feeding_reminder ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FAF8F5] dark:bg-[#1E1C1A]">
              <div>
                <span className="font-mono text-xs font-semibold text-[#22201D] dark:text-[#F6F4EE] block">
                  NOTIFIKASI PERAMBAN
                </span>
                <span className="text-[11px] text-[#756A5E] dark:text-[#B5ACA1]">
                  Izin pemberitahuan saat kucing terbangun dari siklus tidur panjang.
                </span>
              </div>
              <button
                onClick={() => {
                  if (!settings.notifications && 'Notification' in window) {
                    Notification.requestPermission();
                  }
                  updateSettingField('notifications', !settings.notifications);
                }}
                className={`btn-press px-4 py-1.5 rounded-lg font-mono text-xs font-bold border transition-colors ${
                  settings.notifications
                    ? 'bg-[#22201D] dark:bg-[#F6F4EE] text-[#F8F6F1] dark:text-[#121110] border-[#22201D] dark:border-[#F6F4EE]'
                    : 'bg-[#FCFBF8] dark:bg-[#181615] text-[#756A5E] dark:text-[#7E756B] border-[#E7E2DA] dark:border-[#2D2A26]'
                }`}
              >
                {settings.notifications ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: ACCOUNT ================= */}
      {activeTab === 'account' && (
        <div className="space-y-6">
          {/* Profile Details Form */}
          <div className="bento-card rounded-xl p-5 space-y-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#9E9284] dark:text-[#7E756B]">
                OPERATOR CREDENTIALS
              </span>
              <h3 className="text-base font-bold text-[#22201D] dark:text-[#F6F4EE]">
                Informasi Profil
              </h3>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-md">
              <div className="space-y-1">
                <label className="font-mono text-xs text-[#756A5E] dark:text-[#B5ACA1] uppercase">
                  NAMA TAMPILAN
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FAF8F5] dark:bg-[#1E1C1A] text-sm text-[#22201D] dark:text-[#F6F4EE] focus:outline-hidden focus:border-[var(--accent)]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono text-xs text-[#756A5E] dark:text-[#B5ACA1] uppercase">
                  ALAMAT EMAIL
                </label>
                <input
                  type="email"
                  required
                  value={displayEmail}
                  onChange={(e) => setDisplayEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FAF8F5] dark:bg-[#1E1C1A] text-sm text-[#22201D] dark:text-[#F6F4EE] focus:outline-hidden focus:border-[var(--accent)]"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="btn-press cta-shimmer px-4 py-2 rounded-lg bg-[#22201D] dark:bg-[#F6F4EE] text-[#F8F6F1] dark:text-[#121110] font-mono text-xs font-semibold uppercase disabled:opacity-40"
              >
                {isUpdatingProfile ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN PROFIL'}
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bento-card rounded-xl p-5 space-y-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#9E9284] dark:text-[#7E756B]">
                SECURITY AUTHENTICATION
              </span>
              <h3 className="text-base font-bold text-[#22201D] dark:text-[#F6F4EE]">
                Ubah Password
              </h3>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
              <div className="space-y-1">
                <label className="font-mono text-xs text-[#756A5E] dark:text-[#B5ACA1] uppercase">
                  PASSWORD SAAT INI
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FAF8F5] dark:bg-[#1E1C1A] text-sm text-[#22201D] dark:text-[#F6F4EE] focus:outline-hidden focus:border-[var(--accent)]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono text-xs text-[#756A5E] dark:text-[#B5ACA1] uppercase">
                  PASSWORD BARU (MIN. 6 KARAKTER)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FAF8F5] dark:bg-[#1E1C1A] text-sm text-[#22201D] dark:text-[#F6F4EE] focus:outline-hidden focus:border-[var(--accent)]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono text-xs text-[#756A5E] dark:text-[#B5ACA1] uppercase">
                  KONFIRMASI PASSWORD BARU
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FAF8F5] dark:bg-[#1E1C1A] text-sm text-[#22201D] dark:text-[#F6F4EE] focus:outline-hidden focus:border-[var(--accent)]"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="btn-press px-4 py-2 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#181615] text-[#22201D] dark:text-[#F6F4EE] font-mono text-xs font-semibold uppercase disabled:opacity-40"
              >
                {isUpdatingPassword ? 'MEMPROSES...' : 'PERBARUI PASSWORD'}
              </button>
            </form>
          </div>

          {/* Danger Zone: Logout & Delete Account */}
          <div className="bento-card rounded-xl p-5 border-rose-300 dark:border-rose-900/50 space-y-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-rose-600 dark:text-rose-400">
                DANGER ZONE
              </span>
              <h3 className="text-base font-bold text-[#22201D] dark:text-[#F6F4EE]">
                Manajemen Sesi & Akun
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  sounds.playClick();
                  onLogout();
                }}
                className="btn-press px-4 py-2 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FCFBF8] dark:bg-[#181615] font-mono text-xs font-semibold text-[#22201D] dark:text-[#F6F4EE] hover:border-[#C8BFB3]"
              >
                KELUAR DARI AKUN (LOGOUT)
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setShowDeleteModal(true);
                }}
                className="btn-press px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-mono text-xs font-semibold flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>HAPUS AKUN PERMANEN</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal Confirmation */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#FCFBF8] dark:bg-[#181615] w-full max-w-md rounded-xl border border-rose-300 dark:border-rose-900/60 p-6 space-y-4 text-left"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DA] dark:border-[#2D2A26]">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm font-mono">
                  <AlertTriangle className="w-4 h-4" />
                  <span>KONFIRMASI PENGHAPUSAN AKUN</span>
                </div>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn-press text-[#756A5E] hover:text-[#22201D]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-[#5A5046] dark:text-[#B5ACA1] leading-relaxed">
                Tindakan ini tidak dapat dibatalkan. Kucing adopsi beserta seluruh inventaris, riwayat, dan preferensi akun akan terhapus secara permanen dari server.
              </p>

              <div className="space-y-1">
                <label className="font-mono text-[11px] text-[#756A5E] dark:text-[#B5ACA1] uppercase">
                  MASUKKAN PASSWORD UNTUK KONFIRMASI:
                </label>
                <input
                  type="password"
                  required
                  placeholder="Password akun"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] bg-[#FAF8F5] dark:bg-[#1E1C1A] text-sm text-[#22201D] dark:text-[#F6F4EE] focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E7E2DA] dark:border-[#2D2A26]">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn-press px-4 py-2 rounded-lg border border-[#E7E2DA] dark:border-[#2D2A26] font-mono text-xs font-semibold text-[#5A5046] dark:text-[#B5ACA1]"
                >
                  BATALKAN
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={!deletePassword || isDeletingAccount}
                  className="btn-press px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-mono text-xs font-semibold disabled:opacity-40"
                >
                  {isDeletingAccount ? 'MENGHAPUS...' : 'YA, HAPUS AKUN'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
