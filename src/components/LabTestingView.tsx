import React, { useEffect, useState } from 'react';
import {
  FlaskConical,
  FileUp,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Lock,
  History,
  Info,
} from 'lucide-react';
import { BatchRecord, LindiResult, UserAccount } from '../types';
import { StatusBadge } from './BrandAssets';
import { evaluateBatchGates } from '../utils/gateEvaluator';

interface LabTestingViewProps {
  batches: BatchRecord[];
  selectedBatchId: string;
  onSelectBatch: (batchId: string) => void;
  onSaveLabTest: (
    batchId: string,
    updatedLab: BatchRecord['ujiLab'],
    alasanKoreksi?: string
  ) => void;
  currentUser: UserAccount;
}

export const LabTestingView: React.FC<LabTestingViewProps> = ({
  batches,
  selectedBatchId,
  onSelectBatch,
  onSaveLabTest,
  currentUser,
}) => {
  const batch =
    batches.find((b) => b.id === selectedBatchId) || batches[0];

  const [lindi, setLindi] = useState<LindiResult>(batch.ujiLab.lindi);
  const [lindiDetail, setLindiDetail] = useState(batch.ujiLab.lindiDetail);
  const [kuatTekan, setKuatTekan] = useState<string>(
    batch.ujiLab.kuatTekan !== null ? String(batch.ujiLab.kuatTekan) : ''
  );
  const [serapanAir, setSerapanAir] = useState<string>(
    batch.ujiLab.serapanAir !== null ? String(batch.ujiLab.serapanAir) : ''
  );
  const [keausan, setKeausan] = useState<string>(
    batch.ujiLab.keausan !== null ? String(batch.ujiLab.keausan) : ''
  );
  const [tanggalUji, setTanggalUji] = useState(
    batch.ujiLab.tanggalUji !== '-' ? batch.ujiLab.tanggalUji : '2026-11-02'
  );
  const [namaLab, setNamaLab] = useState(batch.ujiLab.namaLab);
  const [lampiranLaporan, setLampiranLaporan] = useState(
    batch.ujiLab.lampiranLaporan !== '-'
      ? batch.ujiLab.lampiranLaporan
      : `LHU-${batch.id}-UNIB.pdf`
  );
  const [alasanKoreksi, setAlasanKoreksi] = useState('');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  useEffect(() => {
    setLindi(batch.ujiLab.lindi);
    setLindiDetail(batch.ujiLab.lindiDetail);
    setKuatTekan(
      batch.ujiLab.kuatTekan !== null ? String(batch.ujiLab.kuatTekan) : ''
    );
    setSerapanAir(
      batch.ujiLab.serapanAir !== null ? String(batch.ujiLab.serapanAir) : ''
    );
    setKeausan(
      batch.ujiLab.keausan !== null ? String(batch.ujiLab.keausan) : ''
    );
    setTanggalUji(
      batch.ujiLab.tanggalUji !== '-' ? batch.ujiLab.tanggalUji : '2026-11-02'
    );
    setNamaLab(batch.ujiLab.namaLab);
    setLampiranLaporan(
      batch.ujiLab.lampiranLaporan !== '-'
        ? batch.ujiLab.lampiranLaporan
        : `LHU-${batch.id}-UNIB.pdf`
    );
    setAlasanKoreksi('');
    setSavedNotice(null);
  }, [batch]);

  // Check if batch already had lab test values (so editing is a Correction under FR-7)
  const isCorrectionMode =
    batch.ujiLab.kuatTekan !== null ||
    batch.ujiLab.lindi === 'Melebihi Ambang (Gagal)';

  // Live preview of gate evaluation
  const previewLab: BatchRecord['ujiLab'] = {
    lindi,
    lindiDetail,
    kuatTekan:
      kuatTekan.trim() !== '' ? parseFloat(kuatTekan.replace(',', '.')) : null,
    serapanAir:
      serapanAir.trim() !== ''
        ? parseFloat(serapanAir.replace(',', '.'))
        : null,
    keausan:
      keausan.trim() !== '' ? parseFloat(keausan.replace(',', '.')) : null,
    tanggalUji,
    namaLab,
    analis: currentUser.nama,
    lampiranLaporan,
  };

  const liveEval = evaluateBatchGates(
    previewLab,
    batch.rasioCampuran,
    batch.molaritasNaoh,
    batch.lotSekam
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (batch.terkunci) {
      alert(
        'Batch ini telah dikunci oleh Auditor/Admin. Buka kunci terlebih dahulu pada menu Detail Batch jika diperlukan koreksi resmi.'
      );
      return;
    }
    if (isCorrectionMode && alasanKoreksi.trim().length < 5) {
      alert(
        'Sesuai FR-7 PRD: Data uji tidak dapat dihapus dan setiap koreksi wajib disertai catatan alasan yang jelas.'
      );
      return;
    }

    onSaveLabTest(
      batch.id,
      {
        ...previewLab,
        catatanKoreksiTerakhir: isCorrectionMode ? alasanKoreksi : undefined,
      },
      isCorrectionMode ? alasanKoreksi : undefined
    );
    setSavedNotice(
      `Data hasil uji untuk ${batch.id} berhasil disimpan! Status otomatis ditetapkan: ${liveEval.status}.`
    );
    setAlasanKoreksi('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Batch Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Hasil Uji Laboratorium & Gerbang Mutu
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Input hasil uji lindi pra-campuran dan uji fisik 28 hari beserta
            berkas laporan lab (FR-3, FR-4, FR-7).
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

      {savedNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center gap-2.5">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span className="font-semibold">{savedNotice}</span>
        </div>
      )}

      {batch.terkunci && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-center gap-2.5">
          <Lock size={18} className="text-amber-600 shrink-0" />
          <span>
            <strong>Batch Terkunci oleh Auditor:</strong> Data batch{' '}
            {batch.id} telah dikunci untuk pengadaan. Untuk mengoreksi, buka
            kunci terlebih dahulu dari halaman Detail Batch.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Input Hasil Uji */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <FlaskConical size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Formulir Pengujian Batch {batch.id}
                </h3>
                <p className="text-xs text-slate-500">
                  FABA: {batch.sumberFaba} ({batch.lotFaba}) • Sekam:{' '}
                  {batch.sumberSekam} ({batch.lotSekam})
                </p>
              </div>
            </div>
            <StatusBadge status={batch.status} size="md" />
          </div>

          {/* 1. Uji Lindi FABA */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Tahap 1: Uji Lindi FABA (Gerbang 1 — Sebelum Pencampuran)
            </label>
            <select
              value={lindi}
              onChange={(e) => setLindi(e.target.value as LindiResult)}
              disabled={batch.terkunci}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
            >
              <option value="Tidak terdeteksi">
                Tidak terdeteksi (Aman di bawah ambang TCLP — Lolos)
              </option>
              <option value="Melebihi Ambang (Gagal)">
                Melebihi Ambang (Gagal — Batch Otomatis Ditolak)
              </option>
              <option value="Menunggu Uji">Menunggu Uji Laboratorium</option>
            </select>

            <input
              type="text"
              value={lindiDetail}
              onChange={(e) => setLindiDetail(e.target.value)}
              disabled={batch.terkunci}
              placeholder="Rincian konsentrasi logam berat TCLP (Pb, Cr, Cd)..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700"
            />
          </div>

          {/* 2. Uji 28 Hari */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Tahap 2: Hasil Uji Fisik & Mekanik 28 Hari (Gerbang 3 & 4)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Kuat Tekan 28 Hari (MPa)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={kuatTekan}
                  onChange={(e) => setKuatTekan(e.target.value)}
                  disabled={batch.terkunci}
                  placeholder="Contoh: 42"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Ambang: ≥40 (A) / ≥20 (B)
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Serapan Air (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={serapanAir}
                  onChange={(e) => setSerapanAir(e.target.value)}
                  disabled={batch.terkunci}
                  placeholder="Contoh: 2.4"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Ambang: ≤ 3,0%
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Keausan (mm/menit)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={keausan}
                  onChange={(e) => setKeausan(e.target.value)}
                  disabled={batch.terkunci}
                  placeholder="Contoh: 0.078"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Ambang: ≤ 0,090 mm/menit
                </span>
              </div>
            </div>
          </div>

          {/* 3. Identitas Lab & Berkas Laporan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Laboratorium Penguji
              </label>
              <input
                type="text"
                value={namaLab}
                onChange={(e) => setNamaLab(e.target.value)}
                disabled={batch.terkunci}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Tanggal Pengujian
              </label>
              <input
                type="date"
                value={tanggalUji}
                onChange={(e) => setTanggalUji(e.target.value)}
                disabled={batch.terkunci}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Lampiran Berkas Laporan Hasil Uji (PDF)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={lampiranLaporan}
                  onChange={(e) => setLampiranLaporan(e.target.value)}
                  disabled={batch.terkunci}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono text-slate-800"
                  required
                />
                <label className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5">
                  <FileUp size={15} />
                  Pilih PDF
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setLampiranLaporan(file.name);
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* 4. Catatan Alasan Koreksi (Wajib sesuai FR-7) */}
          {isCorrectionMode && (
            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <History size={15} className="text-amber-700" />
                Koreksi Data Uji Terproteksi Audit Log (FR-7)
              </div>
              <p className="text-[11px] text-amber-800">
                Data uji yang telah masuk tidak dapat dihapus. Setiap perubahan
                nilai wajib mencantumkan alasan koreksi yang akan direkam
                permanen beserta waktu dan identitas pelaku.
              </p>
              <textarea
                rows={2}
                value={alasanKoreksi}
                onChange={(e) => setAlasanKoreksi(e.target.value)}
                disabled={batch.terkunci}
                placeholder="Tuliskan alasan koreksi (misal: Penyesuaian angka kalibrasi sertifikat UTM nomor LHU-2026)..."
                className="w-full p-2.5 rounded-xl bg-white border border-amber-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                required
              />
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={batch.terkunci}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-md transition ${
                batch.terkunci
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-[#4F46E5] hover:bg-[#4338CA] shadow-indigo-500/20'
              }`}
            >
              {isCorrectionMode
                ? 'Simpan Koreksi & Catat Log Audit'
                : 'Simpan Hasil Uji & Tetapkan Status'}
            </button>
          </div>
        </form>

        {/* Right Panel: Live Gate Simulation & Threshold Reference (FR-4) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Keputusan Otomatis Sistem (FR-4)
              </h3>
              <StatusBadge status={liveEval.status} size="md" prefixLolos />
            </div>

            <div
              className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                liveEval.layakJual
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : liveEval.status === 'Ditolak'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                {liveEval.layakJual ? (
                  <CheckCircle2 size={16} className="text-emerald-600" />
                ) : liveEval.status === 'Ditolak' ? (
                  <ShieldAlert size={16} className="text-rose-600" />
                ) : (
                  <AlertTriangle size={16} className="text-amber-600" />
                )}
                Status: {liveEval.mutuSni}
              </div>
              <p className="leading-relaxed">{liveEval.alasanStatus}</p>
            </div>

            <div className="space-y-2.5">
              <div className="text-xs font-bold text-slate-700">
                Status 5 Gerbang Keputusan:
              </div>
              {liveEval.gerbang.map((g) => (
                <div
                  key={g.nomor}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-800">{g.nama}</div>
                    <div className="text-[11px] text-slate-500">
                      {g.nilaiAktual}
                    </div>
                  </div>
                  <StatusBadge status={g.status} size="sm" />
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-[11px] text-slate-600 space-y-1">
              <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                <Info size={13} className="text-indigo-600" />
                Ambang Mutu PRD FR-4 (SNI 03-0691-1996):
              </div>
              <ul className="list-disc list-inside space-y-0.5">
                <li>
                  <strong>Mutu A:</strong> Kuat tekan ≥ 40 MPa, Serapan air ≤
                  3%, Keausan ≤ 0,090 mm/menit, Lindi aman.
                </li>
                <li>
                  <strong>Mutu B:</strong> Kuat tekan ≥ 20 MPa, Serapan air ≤
                  3%, Keausan ≤ 0,090 mm/menit, Lindi aman.
                </li>
                <li>
                  <strong>Ditolak:</strong> Uji lindi gagal atau salah satu
                  parameter di luar ambang batas.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
