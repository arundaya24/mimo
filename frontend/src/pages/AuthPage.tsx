import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User } from '../types/pet';
import { sounds } from '../audio/soundSynth';
import { ArrowLeft, Lock, Mail, User as UserIcon, Sparkles } from 'lucide-react';

interface AuthPageProps {
  onSuccess: (user: User, hasCat: boolean) => void;
  onBack: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess, onBack }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    sounds.playClick();

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Nama pemilik harus diisi.');
        if (password.length < 6) throw new Error('Password minimal 6 karakter.');
        const res = await authService.register(name, email, password);
        sounds.playPurr();
        onSuccess(res.user, false);
      } else {
        const res = await authService.login(email, password);
        sounds.playPurr();
        onSuccess(res.user, res.has_cat);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memproses autentikasi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 paper-texture">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl border-2 border-cream-300 shadow-xl p-6 sm:p-8 relative">
        
        {/* Back navigation */}
        <button
          onClick={() => {
            sounds.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 text-xs text-brown-500 hover:text-charcoal-800 transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Halaman Utama</span>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-terracotta-100 text-terracotta-600 flex items-center justify-center mx-auto text-2xl mb-3 shadow-2xs">
            🐾
          </div>
          <h2 className="text-2xl font-heading font-bold text-charcoal-900">
            {isRegister ? 'Daftar Akun Pemilik' : 'Selamat Datang Kembali'}
          </h2>
          <p className="text-xs text-brown-500 mt-1">
            {isRegister
              ? 'Mulai perjalananmu merawat kucing digital penuh emosi'
              : 'Masuk untuk menyapa kucing kesayanganmu'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-cream-200/80 p-1 rounded-2xl mb-6 border border-cream-300">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setIsRegister(false);
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              !isRegister
                ? 'bg-white text-charcoal-800 shadow-2xs'
                : 'text-brown-500 hover:text-charcoal-800'
            }`}
          >
            Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setIsRegister(true);
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              isRegister
                ? 'bg-white text-charcoal-800 shadow-2xs'
                : 'text-brown-500 hover:text-charcoal-800'
            }`}
          >
            Daftar Akun Baru
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                Nama Pemilik
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-brown-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Kalingga"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-cream-50 border border-cream-300 focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-xs sm:text-sm text-charcoal-800"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-brown-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-cream-50 border border-cream-300 focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-xs sm:text-sm text-charcoal-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Kata Sandi (Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-brown-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-cream-50 border border-cream-300 focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-xs sm:text-sm text-charcoal-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="tactile-btn w-full mt-2 py-3 rounded-2xl bg-terracotta-500 hover:bg-terracotta-600 disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? (
              <span>Memproses...</span>
            ) : isRegister ? (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Buat Akun & Mulai Adopsi</span>
              </>
            ) : (
              <span>Masuk Sekarang</span>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] text-brown-400">
          Dengan melanjutkan, data kucingmu akan disimpan secara aman di cloud MIMO.
        </p>
      </div>
    </div>
  );
};
