import React, { useState } from 'react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  QrCode,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { DEMO_USERS } from '../data/initialData';
import { UserAccount } from '../types';
import { GeopaveLogo } from './BrandAssets';

interface LoginViewProps {
  onLogin: (user: UserAccount) => void;
  onEnterPublicAuditor: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  onEnterPublicAuditor,
}) => {
  const [username, setUsername] = useState('yusuf.arrayyan@geopave-trace.id');
  const [password, setPassword] = useState('geopave2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedDemoUser, setSelectedDemoUser] = useState<UserAccount>(
    DEMO_USERS[0]
  );

  const handleSelectRole = (u: UserAccount) => {
    setSelectedDemoUser(u);
    setUsername(u.email);
    setPassword('geopave2026');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matched =
      DEMO_USERS.find(
        (u) =>
          u.email.toLowerCase() === username.trim().toLowerCase() ||
          u.username.toLowerCase() === username.trim().toLowerCase() ||
          u.nama.toLowerCase() === username.trim().toLowerCase()
      ) || selectedDemoUser;
    onLogin(matched);
  };

  return (
    <div className="min-h-screen bg-[#EEF2FA] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        {/* Left Branding Panel (Matches Top-Left Screen in UI Mockup) */}
        <div className="lg:col-span-5 relative bg-gradient-to-b from-[#F5F7FF] via-[#E8ECFF] to-[#D8DFFF] p-8 sm:p-10 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-indigo-100">
          {/* Decorative Soft Waves */}
          <div className="absolute -right-24 top-1/3 w-80 h-80 rounded-full bg-indigo-400/15 blur-2xl pointer-events-none" />
          <div className="absolute -left-20 bottom-0 w-72 h-72 rounded-full bg-indigo-600/15 blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-5">
            <GeopaveLogo size="lg" />
            <p className="text-sm sm:text-base font-medium text-slate-700 leading-relaxed max-w-xs">
              Paving Geopolimer Berkualitas, Tertelusur, untuk Masa Depan
              Berkelanjutan
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-800 text-xs font-semibold">
              <ShieldCheck size={14} className="text-indigo-600" />
              Sistem 5 Gerbang Mutu • SNI 03-0691-1996
            </div>
          </div>

          {/* 3D Paving Block Visual with QR Code on Side */}
          <div className="relative z-10 my-6">
            <div className="rounded-2xl overflow-hidden shadow-xl border-2 border-white/80 bg-slate-900">
              <div
                className="h-52 w-full bg-cover bg-center"
                style={{
                  backgroundImage: `url('/geopave-sekam-infographic.png')`,
                  backgroundPosition: '46% 28%',
                  backgroundSize: '215%',
                }}
              />
              <div className="bg-slate-900/95 text-white px-4 py-2.5 flex items-center justify-between text-xs">
                <span className="font-medium text-indigo-200">
                  FABA PLTU + Aktivator Silika Sekam
                </span>
                <span className="font-mono font-bold text-emerald-400">
                  -39% Emisi CO₂
                </span>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-[11px] text-slate-500 flex items-center justify-between">
            <span>GEOPAVE-SEKAM • Engineer Fest 2026</span>
            <span className="font-semibold text-indigo-700">v1.0 Pilot</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md mx-auto w-full space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Selamat Datang
              </h1>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                Masuk ke akun GEOPAVE Trace untuk mengelola data batch dan
                kualitas paving.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Email atau username"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="inline-flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Ingat saya
                </label>
                <button
                  type="button"
                  onClick={() =>
                    alert(
                      'Silakan pilih salah satu akun peran di bawah untuk langsung masuk pada mode demonstrasi.'
                    )
                  }
                  className="font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Lupa password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition active:scale-[0.99]"
              >
                Masuk
              </button>
            </form>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200" />
              <span className="flex-shrink mx-4 text-xs text-slate-400">
                atau
              </span>
              <div className="flex-grow border-t border-slate-200" />
            </div>

            <button
              type="button"
              onClick={onEnterPublicAuditor}
              className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-indigo-50/40 text-slate-700 font-semibold text-sm flex items-center justify-center gap-2 transition"
            >
              <QrCode size={18} className="text-indigo-600" />
              Masuk sebagai Auditor Publik
            </button>

            {/* Quick Role Switcher for Demo / Testing All PRD Section 2 Users */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-2">
                <Sparkles size={13} className="text-indigo-600" />
                Pilih Peran Pengguna (Sesuai Bagian 2 PRD):
              </div>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_USERS.map((u) => {
                  const active = selectedDemoUser.id === u.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSelectRole(u)}
                      className={`text-left p-2 rounded-xl border text-xs transition ${
                        active
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-1 ring-indigo-600/20'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <div className="font-bold truncate">{u.labelPeran}</div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {u.nama}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-center text-xs text-slate-400">
              Belum punya akun?{' '}
              <button
                type="button"
                onClick={() => handleSelectRole(DEMO_USERS[0])}
                className="text-indigo-600 font-semibold hover:underline"
              >
                Hubungi admin.
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
