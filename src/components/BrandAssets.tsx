import React from 'react';
import { CheckCircle2, AlertTriangle, Clock, ShieldCheck } from 'lucide-react';
import { BatchStatus } from '../types';

interface LogoProps {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}

export const GeopaveLogo: React.FC<LogoProps> = ({
  variant = 'light',
  size = 'md',
}) => {
  const iconSize =
    size === 'sm'
      ? 'w-8 h-8'
      : size === 'md'
      ? 'w-10 h-10'
      : size === 'lg'
      ? 'w-14 h-14'
      : 'w-20 h-20';

  const titleSize =
    size === 'sm'
      ? 'text-base'
      : size === 'md'
      ? 'text-lg'
      : size === 'lg'
      ? 'text-2xl'
      : 'text-3xl';

  const subSize =
    size === 'sm'
      ? 'text-xs'
      : size === 'md'
      ? 'text-sm'
      : size === 'lg'
      ? 'text-xl'
      : 'text-2xl';

  return (
    <div className="inline-flex items-center gap-3 select-none">
      <div
        className={`${iconSize} relative flex items-center justify-center rounded-xl overflow-hidden bg-white p-1 shadow-sm ring-1 ring-indigo-500/20 shrink-0`}
      >
        <img
          src="/logo.png"
          alt="GEOPAVE Trace Logo"
          className="w-full h-full object-contain"
        />
      </div>
      <div className="flex flex-col leading-none">
        <span
          className={`font-extrabold tracking-tight ${titleSize} ${
            variant === 'dark' ? 'text-white' : 'text-[#181F4B]'
          }`}
        >
          GEOPAVE
        </span>
        <span
          className={`font-bold tracking-tight ${subSize} ${
            variant === 'dark' ? 'text-indigo-300' : 'text-[#4F46E5]'
          }`}
        >
          Trace
        </span>
      </div>
    </div>
  );
};

interface StatusBadgeProps {
  status: BatchStatus | 'Lolos' | 'Gagal' | 'Memenuhi';
  size?: 'sm' | 'md' | 'lg';
  prefixLolos?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  prefixLolos = false,
}) => {
  const sizeClasses =
    size === 'sm'
      ? 'px-2.5 py-0.5 text-xs gap-1'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-sm gap-1.5'
      : 'px-3 py-1 text-xs gap-1.5';

  const iconSize = size === 'sm' ? 13 : size === 'lg' ? 16 : 14;

  if (status === 'Mutu A' || status === 'Lolos' || status === 'Memenuhi') {
    const label =
      status === 'Mutu A' && prefixLolos ? 'Lolos Mutu A' : status;
    return (
      <span
        className={`inline-flex items-center font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/80 ${sizeClasses}`}
      >
        <CheckCircle2
          size={iconSize}
          className="text-emerald-600 fill-emerald-600/15 shrink-0"
        />
        {label}
      </span>
    );
  }

  if (status === 'Mutu B') {
    const label = prefixLolos ? 'Lolos Mutu B' : 'Mutu B';
    return (
      <span
        className={`inline-flex items-center font-semibold rounded-full bg-teal-100 text-teal-800 border border-teal-200/80 ${sizeClasses}`}
      >
        <CheckCircle2
          size={iconSize}
          className="text-teal-600 fill-teal-600/15 shrink-0"
        />
        {label}
      </span>
    );
  }

  if (status === 'Ditolak' || status === 'Gagal') {
    return (
      <span
        className={`inline-flex items-center font-semibold rounded-full bg-rose-100 text-rose-700 border border-rose-200/80 ${sizeClasses}`}
      >
        <AlertTriangle
          size={iconSize}
          className="text-rose-600 fill-rose-600/15 shrink-0"
        />
        {status}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200/80 ${sizeClasses}`}
    >
      <Clock size={iconSize} className="text-amber-600 shrink-0" />
      Menunggu
    </span>
  );
};

export const PavingSideQrIllustration: React.FC<{
  batchId?: string;
  compact?: boolean;
}> = ({ batchId = 'GP-2026-012', compact = false }) => {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 via-slate-700 to-indigo-950 border border-slate-300/60 shadow-inner ${
        compact ? 'h-40' : 'h-48'
      } flex items-center justify-center`}
    >
      {/* Background construction yard blur */}
      <div
        className="absolute inset-0 opacity-35 bg-cover bg-center"
        style={{
          backgroundImage: `url('/geopave-sekam-infographic.png')`,
          backgroundPosition: '48% 28%',
          backgroundSize: '230%',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-900/25 to-transparent" />

      {/* Realistic 3D Geopolymer Paving Block with Side QR Label */}
      <div className="relative z-10 flex items-center gap-4 px-4">
        <div className="relative bg-gradient-to-br from-stone-400 via-stone-500 to-stone-600 rounded-lg p-3 shadow-2xl border border-stone-300/40 w-64 sm:w-72">
          {/* Concrete speckle texture */}
          <div className="flex items-center justify-between text-[10px] font-mono text-stone-100/90 mb-1.5 border-b border-stone-400/40 pb-1">
            <span>GEOPOLIMER FABA + SEKAM</span>
            <span>20 × 10 × 6 cm</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-left">
              <div className="text-[11px] font-semibold text-white/95">
                Sisi Samping Paving
              </div>
              <p className="text-[10px] text-stone-200 leading-tight mt-0.5">
                Label QR terlindung dari aus gesekan roda di permukaan atas.
              </p>
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-[10px] font-medium">
                <ShieldCheck size={11} /> SNI 03-0691-1996
              </div>
            </div>

            {/* Side QR plate */}
            <div className="bg-white p-1.5 rounded-md shadow-md shrink-0 flex flex-col items-center border border-slate-200">
              <div className="w-12 h-12 bg-slate-900 p-1 rounded-sm grid grid-cols-5 grid-rows-5 gap-0.5">
                <div className="col-span-2 row-span-2 border-2 border-white bg-slate-900" />
                <div className="bg-white" />
                <div className="col-span-2 row-span-2 border-2 border-white bg-slate-900" />
                <div className="bg-white" />
                <div className="bg-white" />
                <div className="bg-slate-900" />
                <div className="bg-white" />
                <div className="bg-white" />
                <div className="bg-slate-900" />
                <div className="bg-white" />
                <div className="col-span-2 row-span-2 border-2 border-white bg-slate-900" />
                <div className="bg-white" />
                <div className="bg-slate-900" />
                <div className="bg-white" />
              </div>
              <span className="text-[8px] font-mono font-bold text-slate-900 mt-0.5 tracking-tighter">
                {batchId}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
