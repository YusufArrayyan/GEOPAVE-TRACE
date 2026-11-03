import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Calendar,
  Download,
  Printer,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { AuditLogEntry, BatchRecord } from '../types';
import { StatusBadge } from './BrandAssets';

interface ReportsViewProps {
  batches: BatchRecord[];
  auditLogs: AuditLogEntry[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  batches,
  auditLogs,
}) => {
  const [format, setFormat] = useState<'PDF' | 'CSV'>('PDF');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-11-02');
  const [lokasiFilter, setLokasiFilter] = useState('Semua Lokasi');
  const [jenisLaporan, setJenisLaporan] = useState({
    ringkasanBatch: true,
    hasilUji: true,
    statusMutu: true,
    logAudit: true,
  });
  const [generatedSuccess, setGeneratedSuccess] = useState<string | null>(null);

  const filteredBatches = batches.filter((b) => {
    const inDate =
      b.tanggalProduksi >= startDate && b.tanggalProduksi <= endDate;
    const inLokasi =
      lokasiFilter === 'Semua Lokasi' || b.lokasi === lokasiFilter;
    return inDate && inLokasi;
  });

  const filteredLogs = auditLogs.filter((l) => {
    return l.tanggalFilter >= startDate && l.tanggalFilter <= endDate;
  });

  const handleGenerateReport = () => {
    if (format === 'CSV') {
      const headers: string[] = ['No. Batch', 'Tanggal Produksi', 'Lokasi', 'Operator'];
      if (jenisLaporan.ringkasanBatch) {
        headers.push(
          'Sumber FABA',
          'Lot FABA',
          'Sumber Sekam',
          'Lot Sekam',
          'Lot NaOH',
          'Rasio Campuran',
          'Molaritas NaOH'
        );
      }
      if (jenisLaporan.hasilUji) {
        headers.push(
          'Uji Lindi',
          'Kuat Tekan 28 Hari (MPa)',
          'Serapan Air (%)',
          'Keausan (mm/menit)',
          'Laboratorium'
        );
      }
      if (jenisLaporan.statusMutu) {
        headers.push('Status Mutu SNI', 'Terkunci Audit', 'Keterangan');
      }

      const rows = filteredBatches.map((b) => {
        const row: (string | number)[] = [
          b.id,
          b.tanggalDisplay,
          b.lokasi,
          b.operator,
        ];
        if (jenisLaporan.ringkasanBatch) {
          row.push(
            b.sumberFaba,
            b.lotFaba,
            b.sumberSekam,
            b.lotSekam,
            b.lotNaoh,
            b.rasioCampuran,
            b.molaritasNaoh
          );
        }
        if (jenisLaporan.hasilUji) {
          row.push(
            b.ujiLab.lindi,
            b.ujiLab.kuatTekan ?? '-',
            b.ujiLab.serapanAir ?? '-',
            b.ujiLab.keausan ?? '-',
            b.ujiLab.namaLab
          );
        }
        if (jenisLaporan.statusMutu) {
          row.push(
            b.status,
            b.terkunci ? 'Terkunci' : 'Terbuka',
            `"${b.alasanStatus.replace(/"/g, '""')}"`
          );
        }
        return row.join(',');
      });

      let csvContent = '\uFEFF' + headers.join(',') + '\n' + rows.join('\n');

      if (jenisLaporan.logAudit && filteredLogs.length > 0) {
        csvContent +=
          '\n\nLOG AUDIT KETERTELUSURAN\nID Log,Waktu,No. Batch,Pelaku,Peran,Aksi,Ringkasan,Alasan Koreksi\n';
        csvContent += filteredLogs
          .map(
            (l) =>
              `${l.id},"${l.waktu}",${l.batchId},"${l.pelaku}","${l.peran}","${l.aksi}","${l.ringkasan.replace(/"/g, '""')}","${(l.alasanKoreksi || '-').replace(/"/g, '""')}"`
          )
          .join('\n');
      }

      const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Laporan-GEOPAVE-Trace-${startDate}-sd-${endDate}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      setGeneratedSuccess(
        `Berhasil mengekspor berkas CSV (${filteredBatches.length} batch & ${filteredLogs.length} catatan audit).`
      );
    } else {
      setGeneratedSuccess(
        `Laporan PDF resmi Pengadaan Hijau & Audit (${filteredBatches.length} batch) siap dicetak / disimpan sebagai PDF.`
      );
      setTimeout(() => {
        window.print();
      }, 250);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Configuration Card (Matches Screen 8 "Laporan" in Bottom-Center of UI Mockup) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Laporan</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Ekspor laporan batch dalam format PDF atau CSV.
          </p>
        </div>

        {/* Format Toggle (`PDF` / `CSV`) & `Generate Laporan` Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFormat('PDF')}
              className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition ${
                format === 'PDF'
                  ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 ring-2 ring-indigo-600/15'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <FileText
                size={17}
                className={
                  format === 'PDF' ? 'text-rose-600' : 'text-slate-400'
                }
              />
              PDF
            </button>

            <button
              type="button"
              onClick={() => setFormat('CSV')}
              className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition ${
                format === 'CSV'
                  ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 ring-2 ring-indigo-600/15'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <FileSpreadsheet
                size={17}
                className={
                  format === 'CSV' ? 'text-emerald-600' : 'text-slate-400'
                }
              />
              CSV
            </button>
          </div>

          <button
            type="button"
            onClick={handleGenerateReport}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-500/20 transition"
          >
            {format === 'CSV' ? (
              <Download size={16} />
            ) : (
              <Printer size={16} />
            )}
            Generate Laporan
          </button>
        </div>

        {/* Periode & Lokasi Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Periode
            </label>
            <div className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50/50">
              <Calendar size={16} className="text-slate-400 ml-1.5 shrink-0" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-medium text-slate-800 focus:outline-none w-full"
              />
              <span className="text-slate-400 text-xs">—</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-medium text-slate-800 focus:outline-none w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Lokasi
            </label>
            <select
              value={lokasiFilter}
              onChange={(e) => setLokasiFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
            >
              <option value="Semua Lokasi">Semua Lokasi</option>
              <option value="Bengkulu">Bengkulu</option>
              <option value="Mukomuko">Mukomuko</option>
              <option value="Kaur">Kaur</option>
            </select>
          </div>
        </div>

        {/* Jenis Laporan Checkboxes (Matches Screen 8 in UI Mockup) */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700">
            Jenis Laporan
          </label>
          <div className="space-y-2.5 text-xs sm:text-sm text-slate-700">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={jenisLaporan.ringkasanBatch}
                onChange={(e) =>
                  setJenisLaporan((s) => ({
                    ...s,
                    ringkasanBatch: e.target.checked,
                  }))
                }
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-medium">Ringkasan Batch</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={jenisLaporan.hasilUji}
                onChange={(e) =>
                  setJenisLaporan((s) => ({
                    ...s,
                    hasilUji: e.target.checked,
                  }))
                }
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-medium">Hasil Uji</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={jenisLaporan.statusMutu}
                onChange={(e) =>
                  setJenisLaporan((s) => ({
                    ...s,
                    statusMutu: e.target.checked,
                  }))
                }
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-medium">Status Mutu</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={jenisLaporan.logAudit}
                onChange={(e) =>
                  setJenisLaporan((s) => ({
                    ...s,
                    logAudit: e.target.checked,
                  }))
                }
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-medium">Log Audit</span>
            </label>
          </div>
        </div>

        {generatedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center gap-2.5">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span className="font-semibold">{generatedSuccess}</span>
          </div>
        )}
      </div>

      {/* Live Preview of Report for Procurement & Audit (PRD FR-9 & Bagian 10) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <Building2 size={20} className="text-indigo-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pratinjau Dokumen Audit & Pengadaan Hijau Pemerintah Daerah
              </h3>
              <p className="text-xs text-slate-500">
                Periode: {startDate} s/d {endDate} • Lokasi: {lokasiFilter} (
                {filteredBatches.length} Batch)
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
            Format: {format}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <th className="py-3 px-3">Batch</th>
                <th className="py-3 px-3">Tanggal & Lokasi</th>
                {jenisLaporan.ringkasanBatch && (
                  <th className="py-3 px-3">Asal Bahan (FABA, Sekam, NaOH)</th>
                )}
                {jenisLaporan.hasilUji && (
                  <th className="py-3 px-3">
                    Hasil Uji (Lindi | Kuat Tekan | Serapan | Aus)
                  </th>
                )}
                {jenisLaporan.statusMutu && (
                  <th className="py-3 px-3 text-right">Status SNI</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBatches.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                    {b.id}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {b.tanggalDisplay} • {b.lokasi}
                  </td>
                  {jenisLaporan.ringkasanBatch && (
                    <td className="py-3 px-3 text-slate-600">
                      FABA: {b.sumberFaba} ({b.lotFaba}) | Sekam: {b.lotSekam} |
                      NaOH: {b.lotNaoh} ({b.molaritasNaoh})
                    </td>
                  )}
                  {jenisLaporan.hasilUji && (
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {b.ujiLab.lindi} |{' '}
                      {b.ujiLab.kuatTekan !== null
                        ? `${b.ujiLab.kuatTekan} MPa`
                        : '-'}{' '}
                      |{' '}
                      {b.ujiLab.serapanAir !== null
                        ? `${b.ujiLab.serapanAir}%`
                        : '-'}{' '}
                      |{' '}
                      {b.ujiLab.keausan !== null
                        ? `${b.ujiLab.keausan} mm/mnt`
                        : '-'}
                    </td>
                  )}
                  {jenisLaporan.statusMutu && (
                    <td className="py-3 px-3 text-right">
                      <StatusBadge status={b.status} size="sm" />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
