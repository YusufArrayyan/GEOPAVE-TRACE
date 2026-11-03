import React, { useState } from 'react';
import {
  Download,
  FileCode,
  Printer,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  QrCode,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import { BatchRecord } from '../types';
import { StatusBadge } from './BrandAssets';
import {
  QrCodeDisplay,
  generateQrPngDataUrl,
  generateQrSvgString,
} from './QrCodeCanvas';

interface QrAndPublishViewProps {
  batches: BatchRecord[];
  selectedBatchId: string;
  onSelectBatch: (batchId: string) => void;
  onOpenPublicPage: (batchId: string) => void;
  onLogQrPrint: (batchId: string, format: string) => void;
}

export const QrAndPublishView: React.FC<QrAndPublishViewProps> = ({
  batches,
  selectedBatchId,
  onSelectBatch,
  onOpenPublicPage,
  onLogQrPrint,
}) => {
  const [copied, setCopied] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const batch =
    batches.find((b) => b.id === selectedBatchId) || batches[0];
  const publicUrl = `${window.location.origin}/?batch=${batch.id}`;
  const isEligible = batch.status === 'Mutu A' || batch.status === 'Mutu B';

  const handleDownloadPng = async () => {
    try {
      const qrDataUrl = await generateQrPngDataUrl(publicUrl, 600);
      // Create composite label canvas with Batch ID, Status, and QR
      const canvas = document.createElement('canvas');
      canvas.width = 720;
      canvas.height = 860;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 6;
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

      // Header
      ctx.fillStyle = '#131836';
      ctx.font = 'bold 34px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GEOPAVE TRACE — LABEL QR BATCH', canvas.width / 2, 85);

      ctx.fillStyle = '#4F46E5';
      ctx.font = 'bold 42px monospace';
      ctx.fillText(batch.id, canvas.width / 2, 145);

      ctx.fillStyle = isEligible ? '#15803D' : '#B91C1C';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText(
        `STATUS: ${batch.status.toUpperCase()} (SNI 03-0691-1996)`,
        canvas.width / 2,
        190
      );

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 110, 215, 500, 500);
        ctx.fillStyle = '#334155';
        ctx.font = '20px sans-serif';
        ctx.fillText(
          `Lokasi: ${batch.lokasi} | Tgl: ${batch.tanggalDisplay} | FABA Lot: ${batch.lotFaba}`,
          canvas.width / 2,
          755
        );
        ctx.fillStyle = '#64748B';
        ctx.font = '18px monospace';
        ctx.fillText(
          'Pasang di sisi samping paving (6 cm) & palet distribusi',
          canvas.width / 2,
          795
        );

        const link = document.createElement('a');
        link.download = `QR-${batch.id}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        onLogQrPrint(batch.id, 'PNG');
      };
      img.src = qrDataUrl;
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadSvg = async () => {
    try {
      const svgString = await generateQrSvgString(publicUrl);
      const blob = new Blob([svgString], {
        type: 'image/svg+xml;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `QR-${batch.id}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      onLogQrPrint(batch.id, 'SVG');
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Batch Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">
            QR & Publikasi
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Buat QR untuk batch yang sudah lolos uji.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600">
            Pilih Batch:
          </label>
          <select
            value={batch.id}
            onChange={(e) => onSelectBatch(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-mono font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
          >
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.id} — {b.status} ({b.lokasi})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Warning if batch failed test (PRD Goal #2) */}
      {!isEligible && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs sm:text-sm text-rose-900">
          <ShieldAlert size={20} className="text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">
              Penerbitan Label Layak Jual Diblokir (Tujuan MVP #2 & FR-4)
            </div>
            <p className="mt-0.5 text-rose-700">
              Batch <strong>{batch.id}</strong> berstatus{' '}
              <strong>{batch.status}</strong> ({batch.alasanStatus}). Sistem
              mengunci pencetakan label QR Layak Jual untuk mencegah peredaran
              paving di bawah standar mutu.
            </p>
          </div>
        </div>
      )}

      {/* Main QR Card & Download Buttons (Matches Bottom-Left Screen of UI Mockup) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: QR Preview Box */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="w-full max-w-sm rounded-2xl border border-slate-200/90 bg-slate-50/50 p-6 flex flex-col items-center text-center shadow-inner">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-xl font-extrabold text-slate-900 font-mono">
                  {batch.id}
                </span>
                <StatusBadge status={batch.status} size="md" />
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <QrCodeDisplay value={publicUrl} size={210} />
              </div>

              <div className="mt-4 text-xs text-slate-500 space-y-1">
                <div className="font-medium text-slate-700">
                  {batch.unitProduksi} • {batch.tanggalDisplay}
                </div>
                <div className="font-mono text-[11px] text-indigo-600 truncate max-w-[260px]">
                  geopave-trace.id/{batch.id}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-3 text-center">
              QR dapat dipasang di sisi samping paving dan pada palet.
            </p>
          </div>

          {/* Right Column: Unduh QR Actions */}
          <div className="lg:col-span-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Unduh QR</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Format resolusi tinggi untuk stiker tahan air palet atau cetakan
                samping paving (6 cm).
              </p>
            </div>

            <div className="space-y-3 max-w-sm">
              <button
                onClick={handleDownloadPng}
                disabled={!isEligible}
                className={`w-full py-3.5 px-5 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 transition ${
                  isEligible
                    ? 'border-slate-200 bg-white hover:bg-indigo-50/50 hover:border-indigo-300 text-slate-800 shadow-sm'
                    : 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Download size={17} className="text-indigo-600" />
                Download PNG
              </button>

              <button
                onClick={handleDownloadSvg}
                disabled={!isEligible}
                className={`w-full py-3.5 px-5 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 transition ${
                  isEligible
                    ? 'border-slate-200 bg-white hover:bg-indigo-50/50 hover:border-indigo-300 text-slate-800 shadow-sm'
                    : 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <FileCode size={17} className="text-indigo-600" />
                Download SVG
              </button>

              <button
                onClick={() => {
                  setShowPrintPreview(true);
                  onLogQrPrint(batch.id, 'Cetak Label');
                }}
                disabled={!isEligible}
                className={`w-full py-3.5 px-5 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 transition ${
                  isEligible
                    ? 'border-slate-200 bg-white hover:bg-indigo-50/50 hover:border-indigo-300 text-slate-800 shadow-sm'
                    : 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Printer size={17} className="text-indigo-600" />
                Cetak Label
              </button>
            </div>

            {/* Public Link & Direct Verification Preview */}
            <div className="pt-4 border-t border-slate-100 max-w-sm space-y-2.5">
              <div className="text-xs font-semibold text-slate-600">
                Tautan Publik Hanya-Baca (Tanpa Login — FR-6):
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={publicUrl}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600"
                />
                <button
                  onClick={handleCopyUrl}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"
                  title="Salin URL"
                >
                  {copied ? (
                    <Check size={16} className="text-emerald-600" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>

              <button
                onClick={() => onOpenPublicPage(batch.id)}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition"
              >
                <ExternalLink size={15} />
                Simulasikan Pindai QR (Buka Halaman Publik)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Side Paving & Pallet Placement Guide (PRD Bagian 9 & Infographic) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={17} className="text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Spesifikasi Penempatan QR Anti-Aus (PRD FR-5 & Bagian 9)
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
            <QrCode size={20} className="text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900">
                1. Sisi Samping Paving (Tinggi 6 cm × Panjang 20 cm)
              </div>
              <p className="mt-1 leading-relaxed">
                Karena permukaan atas paving akan mengalami keausan gesekan ban
                dan pejalan kaki, stensil/emboss QR ukuran 3,5 × 3,5 cm
                ditempatkan di <strong>sisi samping</strong> agar tetap terbaca
                saat inspeksi sampel lapangan.
              </p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
            <CheckCircle2
              size={20}
              className="text-emerald-600 shrink-0 mt-0.5"
            />
            <div>
              <div className="font-bold text-slate-900">
                2. Label Palet Distribusi (Ukuran A6 Tahan Cuaca)
              </div>
              <p className="mt-1 leading-relaxed">
                Setiap palet pengiriman (480–500 unit paving) dilengkapi kartu
                QR tersegel yang langsung membuka laporan kuat tekan 28 hari,
                uji lindi FABA, dan sertifikasi SNI 03-0691-1996.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Label Modal */}
      {showPrintPreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Pratinjau Cetak Label QR — {batch.id}
                </h3>
                <p className="text-xs text-slate-500">
                  Siap cetak untuk Label Sisi Samping Paving (6 cm) dan Label
                  Palet Pengiriman
                </p>
              </div>
              <button
                onClick={() => setShowPrintPreview(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Tutup
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              {/* Side Paving Label (6cm height ratio) */}
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center text-center bg-slate-50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-2">
                  Label Sisi Samping Paving (45 × 45 mm)
                </span>
                <div className="bg-white p-3 rounded-lg border-2 border-slate-900 flex flex-col items-center">
                  <QrCodeDisplay value={publicUrl} size={110} />
                  <span className="font-mono font-extrabold text-xs text-slate-900 mt-1">
                    {batch.id}
                  </span>
                </div>
              </div>

              {/* Pallet Label */}
              <div className="border-2 border-slate-800 rounded-xl p-4 bg-white space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-extrabold text-slate-900">
                    GEOPAVE TRACE PALLET
                  </span>
                  <StatusBadge status={batch.status} size="sm" />
                </div>
                <div className="flex items-center gap-3">
                  <QrCodeDisplay value={publicUrl} size={90} />
                  <div className="space-y-1 text-[11px]">
                    <div className="font-mono font-bold text-sm text-slate-900">
                      {batch.id}
                    </div>
                    <div>Tgl: {batch.tanggalDisplay}</div>
                    <div>Lokasi: {batch.lokasi}</div>
                    <div>FABA: {batch.lotFaba} | Sekam: {batch.lotSekam}</div>
                    <div className="font-bold text-emerald-700">
                      Kuat Tekan: {batch.ujiLab.kuatTekan} MPa
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowPrintPreview(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
              >
                Batal
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
              >
                <Printer size={15} />
                Cetak Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
