import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  QrCode,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Smartphone,
  Monitor,
  ShieldCheck,
  Factory,
  FlaskConical,
  Leaf,
  Building2,
  AlertOctagon,
  FileCheck2,
  Search,
} from 'lucide-react';
import { BatchRecord } from '../types';
import { GeopaveLogo, StatusBadge } from './BrandAssets';
import { QrCodeDisplay } from './QrCodeCanvas';

interface PublicTraceViewProps {
  batch: BatchRecord;
  allBatches: BatchRecord[];
  onSelectBatch: (batchId: string) => void;
  onBackToApp: () => void;
  isPublicOnlySession?: boolean;
}

export const PublicTraceView: React.FC<PublicTraceViewProps> = ({
  batch,
  allBatches,
  onSelectBatch,
  onBackToApp,
  isPublicOnlySession = false,
}) => {
  const [viewDevice, setViewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [showQrModal, setShowQrModal] = useState(false);
  const [openSection, setOpenSection] = useState<{
    bahan: boolean;
    uji: boolean;
    mutu: boolean;
  }>({
    bahan: true,
    uji: true,
    mutu: true,
  });

  const publicUrl = `${window.location.origin}/?batch=${batch.id}`;
  const isPass = batch.status === 'Mutu A' || batch.status === 'Mutu B';

  return (
    <div className="min-h-screen bg-[#EEF2FA] flex flex-col">
      {/* Top Control Bar for Verification / Demo Switching */}
      <div className="bg-[#131836] text-white px-4 py-2.5 border-b border-indigo-900/60 shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToApp}
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition"
            >
              <ArrowLeft size={14} />
              {isPublicOnlySession ? 'Halaman Login' : 'Kembali ke Dashboard'}
            </button>
            <span className="text-xs text-indigo-200 hidden sm:inline">
              Halaman Publik Hanya-Baca (Tanpa Login — FR-6)
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick Batch Switcher to test different QR scans */}
            <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1 border border-white/15">
              <Search size={13} className="text-indigo-300" />
              <span className="text-[11px] text-indigo-200 hidden md:inline">
                Simulasi Pindai Batch:
              </span>
              <select
                value={batch.id}
                onChange={(e) => onSelectBatch(e.target.value)}
                className="bg-transparent text-xs font-mono font-semibold text-white focus:outline-none cursor-pointer"
              >
                {allBatches.map((b) => (
                  <option key={b.id} value={b.id} className="text-slate-900">
                    {b.id} ({b.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Desktop vs Mobile Frame Toggle */}
            <div className="inline-flex rounded-lg bg-white/10 p-0.5 border border-white/15">
              <button
                onClick={() => setViewDevice('desktop')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  viewDevice === 'desktop'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-indigo-200 hover:text-white'
                }`}
              >
                <Monitor size={13} />
                <span className="hidden sm:inline">Kartu Web</span>
              </button>
              <button
                onClick={() => setViewDevice('mobile')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  viewDevice === 'mobile'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-indigo-200 hover:text-white'
                }`}
              >
                <Smartphone size={13} />
                <span className="hidden sm:inline">Layar HP</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 py-8 px-4 flex justify-center items-start">
        {viewDevice === 'desktop' ? (
          /* DESKTOP / TABLET PUBLIC CARD (Matches Right-Center Screen of Mockup) */
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
            {/* Public Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
              <GeopaveLogo size="sm" />
              <button
                onClick={() => setShowQrModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition"
              >
                <QrCode size={15} />
                Lihat QR
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Hero Paving Block Photo with Side QR */}
              <div className="relative rounded-xl overflow-hidden h-48 bg-slate-900 border border-slate-200 shadow-sm">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url('/geopave-sekam-infographic.png')`,
                    backgroundPosition: '47% 28%',
                    backgroundSize: '215%',
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/10" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                  <span className="text-[11px] font-medium bg-black/55 backdrop-blur-sm px-2.5 py-1 rounded-md border border-white/15">
                    QR Terpasang di Sisi Samping Paving & Palet
                  </span>
                  <span className="text-[11px] font-mono font-bold bg-indigo-600/90 px-2.5 py-1 rounded-md">
                    20 × 10 × 6 cm
                  </span>
                </div>
              </div>

              {/* Batch Number & Status Badge */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {batch.id}
                  </h1>
                  <StatusBadge status={batch.status} size="md" />
                </div>
                <span className="text-xs font-medium text-slate-500">
                  Terverifikasi Digital
                </span>
              </div>

              {/* Date & Location Strip */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      {batch.tanggalDisplay}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Tanggal Produksi
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      {batch.lokasi}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Lokasi Produksi
                    </div>
                  </div>
                </div>
              </div>

              {/* Asal Bahan Section */}
              <div className="space-y-2.5">
                <h2 className="text-sm font-bold text-slate-900">Asal Bahan</h2>
                <div className="rounded-xl border border-slate-200/80 divide-y divide-slate-100 text-xs">
                  <div className="px-4 py-2.5 flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Factory size={14} className="text-slate-400" />
                      FABA
                    </span>
                    <span className="font-semibold text-slate-800 text-right">
                      {batch.sumberFaba} (Lot: {batch.lotFaba})
                    </span>
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Leaf size={14} className="text-slate-400" />
                      Sekam
                    </span>
                    <span className="font-semibold text-slate-800 text-right">
                      {batch.sumberSekam} (Lot: {batch.lotSekam})
                    </span>
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-2">
                      <FlaskConical size={14} className="text-slate-400" />
                      NaOH
                    </span>
                    <span className="font-semibold text-slate-800 text-right">
                      {batch.lotNaoh} (Molaritas {batch.molaritasNaoh})
                    </span>
                  </div>
                </div>
              </div>

              {/* Hasil Uji Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900">Hasil Uji</h2>
                  <span className="text-[11px] text-slate-500">
                    {batch.ujiLab.namaLab}
                  </span>
                </div>
                <div className="rounded-xl border border-slate-200/80 divide-y divide-slate-100 text-xs">
                  <div className="px-4 py-2.5 flex items-center justify-between">
                    <span className="text-slate-500">Lindi</span>
                    <span
                      className={`font-semibold ${
                        batch.ujiLab.lindi === 'Tidak terdeteksi'
                          ? 'text-slate-800'
                          : 'text-rose-600'
                      }`}
                    >
                      {batch.ujiLab.lindi}
                    </span>
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between">
                    <span className="text-slate-500">Kuat Tekan 28 Hari</span>
                    <span className="font-semibold text-slate-800">
                      {batch.ujiLab.kuatTekan !== null
                        ? `${batch.ujiLab.kuatTekan.toString().replace('.', ',')} MPa`
                        : 'Menunggu Uji'}
                    </span>
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between">
                    <span className="text-slate-500">Serapan Air</span>
                    <span className="font-semibold text-slate-800">
                      {batch.ujiLab.serapanAir !== null
                        ? `${batch.ujiLab.serapanAir.toFixed(1).replace('.', ',')}%`
                        : 'Menunggu Uji'}
                    </span>
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between">
                    <span className="text-slate-500">Keausan</span>
                    <span className="font-semibold text-slate-800">
                      {batch.ujiLab.keausan !== null
                        ? `${batch.ujiLab.keausan.toFixed(3).replace('.', ',')} mm/menit`
                        : 'Menunggu Uji'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Standar Mutu Box */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  isPass
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : batch.status === 'Ditolak'
                    ? 'bg-rose-50 border-rose-200'
                    : 'bg-amber-50 border-amber-200'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Standar Mutu
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5 font-medium">
                    SNI 03-0691-1996 ({batch.status})
                  </div>
                </div>
                {isPass ? (
                  <StatusBadge status="Memenuhi" size="md" />
                ) : batch.status === 'Ditolak' ? (
                  <StatusBadge status="Ditolak" size="md" />
                ) : (
                  <StatusBadge status="Menunggu" size="md" />
                )}
              </div>

              {batch.status === 'Ditolak' && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                  <AlertOctagon size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Peringatan Ketertelusuran: </span>
                    {batch.alasanStatus} Batch ini tidak berstatus layak jual.
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 text-center space-y-1">
                <p className="text-xs font-semibold text-slate-600">
                  Diproduksi oleh {batch.unitProduksi}
                </p>
                <p className="text-[11px] text-slate-400">
                  Untuk pembangunan berkelanjutan • Tanpa semen = Emisi CO₂ per m² lebih rendah hingga 39%
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* SMARTPHONE FRAME VIEW (Matches Bottom-Right Mobile Mockup in UI Board) */
          <div className="w-[360px] bg-slate-900 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 relative">
            {/* iPhone Notch */}
            <div className="w-32 h-5 bg-slate-900 rounded-b-2xl mx-auto absolute top-3 left-1/2 -translate-x-1/2 z-20" />

            <div className="bg-white rounded-[34px] overflow-hidden min-h-[680px] flex flex-col">
              {/* Status Bar */}
              <div className="pt-2 pb-1 px-6 flex items-center justify-between text-[11px] font-bold text-slate-800">
                <span>9:41</span>
                <span className="text-[10px] text-slate-400">5G • 100%</span>
              </div>

              {/* Browser URL Bar (`geopave-trace.id/GP-2026-012`) */}
              <div className="mx-3 my-1.5 px-3 py-1.5 rounded-lg bg-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-600 font-medium border border-slate-200/80">
                <ShieldCheck size={12} className="text-emerald-600" />
                <span className="truncate">
                  geopave-trace.id/{batch.id}
                </span>
              </div>

              {/* App Navbar */}
              <div className="px-4 py-2.5 flex items-center justify-between border-b border-slate-100">
                <GeopaveLogo size="sm" />
                <button
                  onClick={() => setShowQrModal(true)}
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-700"
                >
                  <QrCode size={16} />
                </button>
              </div>

              {/* Mobile Body */}
              <div className="p-4 space-y-3.5 flex-1 overflow-y-auto">
                <div className="relative rounded-xl overflow-hidden h-36 bg-slate-900 border border-slate-200">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url('/geopave-sekam-infographic.png')`,
                      backgroundPosition: '47% 28%',
                      backgroundSize: '220%',
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-extrabold text-slate-900">
                    Batch {batch.id}
                  </span>
                  <StatusBadge status={batch.status} size="sm" prefixLolos />
                </div>

                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px]">
                  <div>
                    <div className="text-slate-400">Tanggal Produksi</div>
                    <div className="font-bold text-slate-800">
                      {batch.tanggalDisplay}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">Lokasi Produksi</div>
                    <div className="font-bold text-slate-800">{batch.lokasi}</div>
                  </div>
                </div>

                {/* Accordion 1: Asal Bahan */}
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <button
                    onClick={() =>
                      setOpenSection((s) => ({ ...s, bahan: !s.bahan }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50/80 flex items-center justify-between text-xs font-bold text-slate-800"
                  >
                    <span className="flex items-center gap-2">
                      <Building2 size={14} className="text-indigo-600" />
                      Asal Bahan
                    </span>
                    {openSection.bahan ? (
                      <ChevronUp size={15} />
                    ) : (
                      <ChevronDown size={15} />
                    )}
                  </button>
                  {openSection.bahan && (
                    <div className="p-3 space-y-1.5 text-[11px] bg-white border-t border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Sumber FABA</span>
                        <span className="font-semibold text-slate-800">
                          {batch.sumberFaba} ({batch.lotFaba})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Sumber Sekam</span>
                        <span className="font-semibold text-slate-800">
                          {batch.sumberSekam} ({batch.lotSekam})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Aktivator NaOH</span>
                        <span className="font-semibold text-slate-800">
                          {batch.lotNaoh} ({batch.molaritasNaoh})
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Accordion 2: Hasil Uji */}
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <button
                    onClick={() =>
                      setOpenSection((s) => ({ ...s, uji: !s.uji }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50/80 flex items-center justify-between text-xs font-bold text-slate-800"
                  >
                    <span className="flex items-center gap-2">
                      <FlaskConical size={14} className="text-indigo-600" />
                      Hasil Uji
                    </span>
                    {openSection.uji ? (
                      <ChevronUp size={15} />
                    ) : (
                      <ChevronDown size={15} />
                    )}
                  </button>
                  {openSection.uji && (
                    <div className="p-3 space-y-1.5 text-[11px] bg-white border-t border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Lindi</span>
                        <span className="font-semibold text-slate-800">
                          {batch.ujiLab.lindi}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Kuat Tekan 28 Hari</span>
                        <span className="font-semibold text-slate-800">
                          {batch.ujiLab.kuatTekan ?? '-'} MPa
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Serapan Air</span>
                        <span className="font-semibold text-slate-800">
                          {batch.ujiLab.serapanAir !== null
                            ? `${batch.ujiLab.serapanAir.toString().replace('.', ',')}%`
                            : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Keausan</span>
                        <span className="font-semibold text-slate-800">
                          {batch.ujiLab.keausan !== null
                            ? `${batch.ujiLab.keausan.toFixed(3).replace('.', ',')} mm/menit`
                            : '-'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Accordion 3: Standar Mutu */}
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <button
                    onClick={() =>
                      setOpenSection((s) => ({ ...s, mutu: !s.mutu }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50/80 flex items-center justify-between text-xs font-bold text-slate-800"
                  >
                    <span className="flex items-center gap-2">
                      <FileCheck2 size={14} className="text-indigo-600" />
                      Standar Mutu
                    </span>
                    {openSection.mutu ? (
                      <ChevronUp size={15} />
                    ) : (
                      <ChevronDown size={15} />
                    )}
                  </button>
                  {openSection.mutu && (
                    <div className="p-3 flex items-center justify-between text-[11px] bg-white border-t border-slate-100">
                      <span className="text-slate-600 font-medium">
                        SNI 03-0691-1996
                      </span>
                      <StatusBadge
                        status={isPass ? 'Memenuhi' : batch.status}
                        size="sm"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-2 text-center text-[10px] text-slate-400">
                  Transparansi untuk pembangunan berkelanjutan
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal QR Code */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">{batch.id}</span>
              <StatusBadge status={batch.status} size="sm" />
            </div>
            <div className="flex justify-center py-2">
              <div className="p-3 rounded-xl border-2 border-slate-200 bg-white shadow-sm">
                <QrCodeDisplay value={publicUrl} size={200} />
              </div>
            </div>
            <p className="text-xs text-slate-500 font-mono break-all bg-slate-50 p-2 rounded-lg border border-slate-200">
              {publicUrl}
            </p>
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
