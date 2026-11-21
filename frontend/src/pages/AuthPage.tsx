import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User } from '../types/pet';
import { sounds } from '../audio/soundSynth';
import { ArrowLeft, Lock, Mail, User as UserIcon, Check } from 'lucide-react';

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
        if (!name.trim()) throw new Error('Nama pemilik wajib diisi.');
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
      setError(err instanceof Error ? err.message : 'Autentikasi gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 bg-[#F8F6F1]">
      <div className="w-full max-w-sm bento-card rounded-xl p-6 sm:p-7 border border-[#E7E2DA] text-left space-y-6">
        
        {/* Back navigation */}
        <button
          onClick={() => {
            sounds.playClick();
            onBack();
          }}
          className="btn-press flex items-center gap-1.5 font-mono text-[11px] text-[#756A5E] hover:text-[#22201D] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>KEMBALI KE BERANDA</span>
        </button>

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#C75D35] bg-[#FDF6F2] px-2 py-0.5 rounded border border-[#EBCBBD]">
              {isRegister ? 'REGISTRATION' : 'AUTHENTICATION'}
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#141311]">
            {isRegister ? 'Daftar Akun Baru' : 'Masuk ke Sistem'}
          </h2>
          <p className="text-xs text-[#756A5E] mt-1">
            {isRegister
              ? 'Inisialisasi profil operator untuk memelihara kucing digital.'
              : 'Gunakan kredensial yang terdaftar untuk melanjutkan.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-0.5 rounded-lg border border-[#E7E2DA] bg-[#F8F6F1] font-mono text-[11px]">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setIsRegister(false);
              setError(null);
            }}
            className={`btn-press py-1.5 rounded-md font-semibold transition-colors ${
              !isRegister
                ? 'bg-[#FCFBF8] text-[#22201D] border border-[#E7E2DA]'
                : 'text-[#756A5E] hover:text-[#22201D]'
            }`}
          >
            LOGIN
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setIsRegister(true);
              setError(null);
            }}
            className={`btn-press py-1.5 rounded-md font-semibold transition-colors ${
              isRegister
                ? 'bg-[#FCFBF8] text-[#22201D] border border-[#E7E2DA]'
                : 'text-[#756A5E] hover:text-[#22201D]'
            }`}
          >
            REGISTER
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-md bg-[#FBF2F0] border border-[#ECC4BD] text-[#A84534] font-mono text-[11px]">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-[#756A5E] mb-1.5">
                NAMA PEMILIK
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#9E9284] absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Kalingga"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#E7E2DA] focus:outline-none focus:border-[#C75D35] text-xs text-[#22201D]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-[#756A5E] mb-1.5">
              ALAMAT EMAIL
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#9E9284] absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@mimo.test"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#E7E2DA] focus:outline-none focus:border-[#C75D35] text-xs text-[#22201D]"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-[#756A5E] mb-1.5">
              KATA SANDI
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9E9284] absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#E7E2DA] focus:outline-none focus:border-[#C75D35] text-xs text-[#22201D]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-press cta-shimmer w-full mt-2 py-2.5 rounded-lg bg-[#22201D] hover:bg-[#322F2B] disabled:opacity-60 text-[#FCFBF8] font-mono text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 border border-[#22201D]"
          >
            {loading ? (
              <span>MEMPROSES...</span>
            ) : isRegister ? (
              <span>BUAT AKUN OPERATOR</span>
            ) : (
              <span>MASUK SESI</span>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-[#E7E2DA] text-center font-mono text-[10px] text-[#9E9284]">
          DATA ENKRIPSI TOKEN SANCTUM 256-BIT
        </div>
      </div>
    </div>
  );
};
