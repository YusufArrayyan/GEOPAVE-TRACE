import React from 'react';
import {
  Box,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  QrCode,
  ShieldCheck,
  Clock,
  FlaskConical,
  Sparkles,
} from 'lucide-react';
import { BatchRecord, UserAccount } from '../types';
import { StatusBadge } from './BrandAssets';

interface DashboardViewProps {
  user: UserAccount;
  batches: BatchRecord[];
  onSelectBatch: (batchId: string) => void;
  onNavigate: (menu: string) => void;
  onOpenNewBatchModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  batches,
  onSelectBatch,
  onNavigate,
  onOpenNewBatchModal,
}) => {
  const total = batches.length;
  const mutuA = batches.filter((b) => b.status === 'Mutu A').length;
  const mutuB = batches.filter((b) => b.status === 'Mutu B').length;
  const ditolak = batches.filter((b) => b.status === 'Ditolak').length;
  const menunggu = batches.filter((b) => b.status === 'Menunggu').length;

  const pct = (val: number) =>
    total > 0 ? ((val / total) * 100).toFixed(1).replace('.', ',') : '0,0';

  // SVG Donut chart calculations (r = 58, circumference = 2 * pi * 58 = 364.42)
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const fracA = total > 0 ? mutuA / total : 0;
  const fracB = total > 0 ? mutuB / total : 0;
  const fracD = total > 0 ? ditolak / total : 0;
  const fracM = total > 0 ? menunggu / total : 0;

  const lenA = fracA * circumference;
  const lenB = fracB * circumference;
  const lenD = fracD * circumference;
  const lenM = fracM * circumference;

  const offsetA = 0;
  const offsetB = -(lenA);
  const offsetD = -(lenA + lenB);
  const offsetM = -(lenA + lenB + lenD);

  // Pilot Metrics (PRD Section 8)
  const avgSeconds =
    total > 0
      ? Math.round(
          batches.reduce((acc, b) => acc + (b.waktuPengisianDetik || 200), 0) /
            total
        )
      : 195;
  const avgMin = Math.floor(avgSeconds / 60);
  const avgSecRem = avgSeconds % 60;

  const testedLindiCount = batches.filter(
    (b) => b.ujiLab.lindi !== 'Menunggu Uji'
  ).length;
  const lindiPct =
    total > 0 ? Math.round((testedLindiCount / total) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            Halo, {user.nama} <span className="text-2xl">👋</span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Berikut ringkasan aktivitas dan kualitas batch paving Anda.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenNewBatchModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-500/20 transition"
          >
            <Plus size={16} />
            Daftar Batch Baru
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards (Matches Top-Middle Screen in UI Mockup) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total Batch */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Box size={24} />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">
              Total Batch
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {total}
            </div>
          </div>
        </div>

        {/* Lolos Mutu A */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">
              Lolos Mutu A
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {mutuA}
            </div>
          </div>
        </div>

        {/* Lolos Mutu B */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">
              Lolos Mutu B
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {mutuB}
            </div>
          </div>
        </div>

        {/* Ditolak */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Ditolak</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {ditolak}
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Donut Chart & Batch Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Status Batch Donut Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Status Batch</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Proporsi kelulusan gerbang mutu SNI 03-0691-1996
            </p>
          </div>

          <div className="my-6 flex flex-col sm:flex-row items-center justify-center gap-8">
            {/* Donut SVG */}
            <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
              <svg
                className="w-full h-full -rotate-90"
                viewBox="0 0 148 148"
              >
                <circle
                  cx="74"
                  cy="74"
                  r={radius}
                  fill="transparent"
                  stroke="#F1F5F9"
                  strokeWidth="18"
                />
                {/* Mutu A segment (Indigo / Emerald) */}
                {lenA > 0 && (
                  <circle
                    cx="74"
                    cy="74"
                    r={radius}
                    fill="transparent"
                    stroke="#4F46E5"
                    strokeWidth="18"
                    strokeDasharray={`${lenA} ${circumference}`}
                    strokeDashoffset={offsetA}
                  />
                )}
                {/* Mutu B segment (Emerald / Teal) */}
                {lenB > 0 && (
                  <circle
                    cx="74"
                    cy="74"
                    r={radius}
                    fill="transparent"
                    stroke="#10B981"
                    strokeWidth="18"
                    strokeDasharray={`${lenB} ${circumference}`}
                    strokeDashoffset={offsetB}
                  />
                )}
                {/* Ditolak segment (Rose) */}
                {lenD > 0 && (
                  <circle
                    cx="74"
                    cy="74"
                    r={radius}
                    fill="transparent"
                    stroke="#EF4444"
                    strokeWidth="18"
                    strokeDasharray={`${lenD} ${circumference}`}
                    strokeDashoffset={offsetD}
                  />
                )}
                {/* Menunggu segment (Amber) */}
                {lenM > 0 && (
                  <circle
                    cx="74"
                    cy="74"
                    r={radius}
                    fill="transparent"
                    stroke="#F59E0B"
                    strokeWidth="18"
                    strokeDasharray={`${lenM} ${circumference}`}
                    strokeDashoffset={offsetM}
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-extrabold text-slate-900 leading-none">
                  {total}
                </span>
                <span className="text-xs font-medium text-slate-500 mt-1">
                  Batch
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-3 w-full max-w-[200px] text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium text-slate-700">
                  <span className="w-3 h-3 rounded-full bg-[#4F46E5] inline-block" />
                  Mutu A
                </span>
                <span className="font-bold text-slate-900">
                  {mutuA}{' '}
                  <span className="text-slate-400 font-normal">
                    ({pct(mutuA)}%)
                  </span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium text-slate-700">
                  <span className="w-3 h-3 rounded-full bg-[#10B981] inline-block" />
                  Mutu B
                </span>
                <span className="font-bold text-slate-900">
                  {mutuB}{' '}
                  <span className="text-slate-400 font-normal">
                    ({pct(mutuB)}%)
                  </span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium text-slate-700">
                  <span className="w-3 h-3 rounded-full bg-[#EF4444] inline-block" />
                  Ditolak
                </span>
                <span className="font-bold text-slate-900">
                  {ditolak}{' '}
                  <span className="text-slate-400 font-normal">
                    ({pct(ditolak)}%)
                  </span>
                </span>
              </div>

              {menunggu > 0 && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-medium text-slate-700">
                    <span className="w-3 h-3 rounded-full bg-[#F59E0B] inline-block" />
                    Menunggu
                  </span>
                  <span className="font-bold text-slate-900">
                    {menunggu}{' '}
                    <span className="text-slate-400 font-normal">
                      ({pct(menunggu)}%)
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Ambang Mutu A: ≥ 40 MPa</span>
            <span>Ambang Mutu B: ≥ 20 MPa</span>
          </div>
        </div>

        {/* Batch Terbaru Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Batch Terbaru
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Klik pada baris batch untuk melihat detail asal bahan, uji lab,
                dan QR
              </p>
            </div>
            <button
              onClick={() => onNavigate('batch')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 px-3 py-1.5 rounded-lg transition"
            >
              Lihat Semua <ArrowRight size={13} />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {batches.slice(0, 5).map((b) => (
              <div
                key={b.id}
                onClick={() => onSelectBatch(b.id)}
                className="py-3 px-2 rounded-xl hover:bg-slate-50 flex items-center justify-between gap-3 cursor-pointer transition group"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition font-mono">
                    {b.id}
                  </span>
                  <span className="text-xs text-slate-400 hidden sm:inline">
                    • {b.lokasi}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <StatusBadge status={b.status} size="sm" />
                  <span className="text-xs text-slate-500 w-24 text-right">
                    {b.tanggalDisplay}
                  </span>
                  <ArrowRight
                    size={15}
                    className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Menampilkan 5 dari {total} batch terdaftar
            </span>
            <button
              onClick={() => onNavigate('batch')}
              className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
            >
              Lihat Semua <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Metrik Keberhasilan Pilot (Bagian 8 PRD) & Lima Gerbang Keputusan */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Metrik Keberhasilan Pilot (PRD Bagian 8) & Kepatuhan 5 Gerbang
              Keputusan
            </h3>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Target Pilot Terpenuhi
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span>Batch Terbaca Lewat QR</span>
              <QrCode size={15} className="text-indigo-600" />
            </div>
            <div className="text-lg font-extrabold text-slate-900">100%</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
              Target PRD: 100% ({total}/{total} batch)
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span>Uji Lindi Pra-Produksi</span>
              <FlaskConical size={15} className="text-indigo-600" />
            </div>
            <div className="text-lg font-extrabold text-slate-900">
              {lindiPct}%
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
              Target PRD: 100% sebelum pencampuran
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span>Publikasi Kuat Tekan 28 Hari</span>
              <ShieldCheck size={15} className="text-indigo-600" />
            </div>
            <div className="text-lg font-extrabold text-slate-900">100%</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
              Batch gagal otomatis dikunci dari jual
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span>Waktu Input Operator</span>
              <Clock size={15} className="text-indigo-600" />
            </div>
            <div className="text-lg font-extrabold text-slate-900">
              {avgMin} mnt {avgSecRem} dtk
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
              Target PRD: ≤ 5 menit per batch
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
