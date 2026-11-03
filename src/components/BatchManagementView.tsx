import React, { useState } from 'react';
import {
  Search,
  Plus,
  MoreHorizontal,
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  QrCode,
  Info,
  Lock,
  Unlock,
  ExternalLink,
  FlaskConical,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowRight,
  ShieldAlert,
  FileText,
  History,
  CheckCircle2,
} from 'lucide-react';
import {
  AuditLogEntry,
  BatchRecord,
  MaterialLot,
  UserAccount,
} from '../types';
import { StatusBadge } from './BrandAssets';
import {
  evaluateBatchGates,
  formatIndonesianDate,
} from '../utils/gateEvaluator';

interface BatchManagementViewProps {
  batches: BatchRecord[];
  materials: MaterialLot[];
  auditLogs: AuditLogEntry[];
  selectedBatchId: string | null;
  onSelectBatch: (batchId: string | null) => void;
  onCreateBatch: (newBatch: BatchRecord) => void;
  onToggleLockBatch: (batchId: string) => void;
  onOpenQrPage: (batchId: string) => void;
  onOpenPublicPage: (batchId: string) => void;
  onOpenLabInput: (batchId: string) => void;
  currentUser: UserAccount;
  showNewBatchModal: boolean;
  setShowNewBatchModal: (show: boolean) => void;
}

export const BatchManagementView: React.FC<BatchManagementViewProps> = ({
  batches,
  materials,
  auditLogs,
  selectedBatchId,
  onSelectBatch,
  onCreateBatch,
  onToggleLockBatch,
  onOpenQrPage,
  onOpenPublicPage,
  onOpenLabInput,
  currentUser,
  showNewBatchModal,
  setShowNewBatchModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<
    'ringkasan' | 'gerbang' | 'riwayat'
  >('ringkasan');

  // New Batch Form State (Matches Screen 4: Daftar Batch Baru)
  const nextNumber = batches.length + 1;
  const defaultNextId = `GP-2026-${String(nextNumber).padStart(3, '0')}`;

  const [tanggalProduksi, setTanggalProduksi] = useState('2026-11-02');
  const [lokasiProduksi, setLokasiProduksi] = useState('Bengkulu');
  const [operatorName, setOperatorName] = useState(currentUser.nama);
  const [sumberFaba, setSumberFaba] = useState('PLTU Tanjung Jati');
  const [lotFaba, setLotFaba] = useState('F-004');
  const [sumberSekam, setSumberSekam] = useState('Desa Suka Maju');
  const [lotSekam, setLotSekam] = useState('S-002');
  const [lotNaoh, setLotNaoh] = useState('N-002');
  const [rasioCampuran, setRasioCampuran] = useState('70 : 30');
  const [molaritasNaoh, setMolaritasNaoh] = useState('12 M');
  const [formStep, setFormStep] = useState<1 | 2>(1);
  const [quickLindi, setQuickLindi] = useState<
    'Tidak terdeteksi' | 'Menunggu Uji' | 'Melebihi Ambang (Gagal)'
  >('Tidak terdeteksi');
  const [quickKuatTekan, setQuickKuatTekan] = useState<string>('43');
  const [quickSerapanAir, setQuickSerapanAir] = useState<string>('2.3');
  const [quickKeausan, setQuickKeausan] = useState<string>('0.076');
  const [includeLabNow, setIncludeLabNow] = useState<boolean>(true);

  const handleSubmitNewBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (formStep === 1) {
      setFormStep(2);
      return;
    }

    const kt =
      includeLabNow && quickKuatTekan.trim() !== ''
        ? parseFloat(quickKuatTekan.replace(',', '.'))
        : null;
    const sa =
      includeLabNow && quickSerapanAir.trim() !== ''
        ? parseFloat(quickSerapanAir.replace(',', '.'))
        : null;
    const ka =
      includeLabNow && quickKeausan.trim() !== ''
        ? parseFloat(quickKeausan.replace(',', '.'))
        : null;

    const ujiLab = {
      lindi: quickLindi,
      lindiDetail:
        quickLindi === 'Tidak terdeteksi'
          ? 'Logam berat di bawah baku mutu TCLP PP 22/2021'
          : quickLindi === 'Melebihi Ambang (Gagal)'
          ? 'Melebihi baku mutu TCLP logam berat'
          : 'Menunggu hasil pengujian laboratorium',
      kuatTekan: kt,
      serapanAir: sa,
      keausan: ka,
      tanggalUji: includeLabNow ? tanggalProduksi : '-',
      namaLab: 'Lab Material & Beton Universitas Bengkulu',
      analis: 'Dr. Eng. Hendra Wijaya',
      lampiranLaporan: includeLabNow ? `LHU-${defaultNextId}-UNIB.pdf` : '-',
    };

    const evalResult = evaluateBatchGates(
      ujiLab,
      rasioCampuran,
      molaritasNaoh,
      lotSekam
    );

    const unitMap: Record<string, string> = {
      Bengkulu: 'UMKM Sejahtera Bersama – Bengkulu',
      Mukomuko: 'UMKM Karya Mandiri – Mukomuko',
      Kaur: 'UMKM Beton Hijau – Kaur',
    };

    const newRecord: BatchRecord = {
      id: defaultNextId,
      tanggalProduksi,
      tanggalDisplay: formatIndonesianDate(tanggalProduksi),
      lokasi: lokasiProduksi,
      unitProduksi:
        unitMap[lokasiProduksi] || `UMKM Mitra – ${lokasiProduksi}`,
      operator: operatorName || 'Yusuf Arrayyan',
      sumberFaba: sumberFaba || 'PLTU Tanjung Jati',
      lotFaba: lotFaba || 'F-004',
      sumberSekam: sumberSekam || 'Desa Suka Maju',
      lotSekam: lotSekam || 'S-002',
      lotNaoh: lotNaoh || 'N-002',
      rasioCampuran: rasioCampuran || '70 : 30',
      molaritasNaoh: molaritasNaoh || '12 M',
      ujiLab,
      status: evalResult.status,
      alasanStatus: evalResult.alasanStatus,
      terkunci: false,
      waktuPengisianDetik: 165,
      synced: navigator.onLine,
      jumlahPavingPalet: 480,
    };

    onCreateBatch(newRecord);
    setShowNewBatchModal(false);
    setFormStep(1);
    onSelectBatch(newRecord.id);
  };

  // Selected Batch Detail View (Matches Center Screen of UI Design Board)
  const selectedBatch = batches.find((b) => b.id === selectedBatchId) || null;

  if (selectedBatch) {
    const evalGates = evaluateBatchGates(
      selectedBatch.ujiLab,
      selectedBatch.rasioCampuran,
      selectedBatch.molaritasNaoh,
      selectedBatch.lotSekam
    );
    const batchLogs = auditLogs.filter(
      (log) => log.batchId === selectedBatch.id
    );

    const lindiPass = selectedBatch.ujiLab.lindi === 'Tidak terdeteksi';
    const ktVal = selectedBatch.ujiLab.kuatTekan;
    const ktPass = ktVal !== null && ktVal >= 20;
    const saVal = selectedBatch.ujiLab.serapanAir;
    const saPass = saVal !== null && saVal <= 3.0;
    const kaVal = selectedBatch.ujiLab.keausan;
    const kaPass = kaVal !== null && kaVal <= 0.09;

    return (
      <div className="space-y-5">
        {/* Top Back Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onSelectBatch(null)}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-800 hover:text-indigo-600 transition"
          >
            <ArrowLeft size={18} />
            Detail Batch
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleLockBatch(selectedBatch.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                selectedBatch.terkunci
                  ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Kunci atau buka kunci batch (Peran Admin/Auditor)"
            >
              {selectedBatch.terkunci ? (
                <>
                  <Lock size={14} /> Terkunci Audit
                </>
              ) : (
                <>
                  <Unlock size={14} /> Kunci Batch
                </>
              )}
            </button>

            <button
              onClick={() => onOpenLabInput(selectedBatch.id)}
              disabled={selectedBatch.terkunci}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                selectedBatch.terkunci
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
              }`}
            >
              <FlaskConical size={14} />
              Input / Koreksi Uji Lab
            </button>
          </div>
        </div>

        {/* Main Detail Card (Matches Center Screen of UI Mockup) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Batch ID, Status & QR Button */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
                {selectedBatch.id}
              </h1>
              <StatusBadge status={selectedBatch.status} size="md" />
              {selectedBatch.terkunci && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  <Lock size={11} /> Dikunci
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onOpenPublicPage(selectedBatch.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-indigo-50/50 text-xs font-semibold text-slate-700 transition"
              >
                <ExternalLink size={14} className="text-indigo-600" />
                Halaman Publik
              </button>
              <button
                onClick={() => onOpenQrPage(selectedBatch.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-xs font-bold text-indigo-700 transition"
              >
                <QrCode size={15} />
                Lihat QR
              </button>
            </div>
          </div>

          {/* 3-Column Identity Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50/80 border border-slate-200/70">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Calendar size={18} />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">
                  {selectedBatch.tanggalDisplay}
                </div>
                <div className="text-xs text-slate-500">Tanggal Produksi</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">
                  {selectedBatch.lokasi}
                </div>
                <div className="text-xs text-slate-500">Lokasi</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <User size={18} />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">
                  {selectedBatch.operator}
                </div>
                <div className="text-xs text-slate-500">Operator</div>
              </div>
            </div>
          </div>

          {/* Sub-navigation Tabs (`Bahan`, `Hasil Uji`, `Status`, `Riwayat`) */}
          <div className="border-b border-slate-200 flex items-center gap-6 text-xs sm:text-sm font-semibold">
            <button
              onClick={() => setActiveDetailTab('ringkasan')}
              className={`pb-3 border-b-2 transition ${
                activeDetailTab === 'ringkasan'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Bahan & Hasil Uji
            </button>
            <button
              onClick={() => setActiveDetailTab('gerbang')}
              className={`pb-3 border-b-2 transition ${
                activeDetailTab === 'gerbang'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Status 5 Gerbang Keputusan
            </button>
            <button
              onClick={() => setActiveDetailTab('riwayat')}
              className={`pb-3 border-b-2 transition flex items-center gap-1.5 ${
                activeDetailTab === 'riwayat'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Riwayat Audit ({batchLogs.length})
            </button>
          </div>

          {activeDetailTab === 'ringkasan' && (
            <div className="space-y-6">
              {/* Asal Bahan Key-Value List */}
              <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <span className="text-slate-500 font-medium">
                    Sumber FABA
                  </span>
                  <span className="sm:col-span-2 font-semibold text-slate-900">
                    {selectedBatch.sumberFaba} (Lot: {selectedBatch.lotFaba})
                  </span>
                </div>
                <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <span className="text-slate-500 font-medium">
                    Sumber Sekam
                  </span>
                  <span className="sm:col-span-2 font-semibold text-slate-900">
                    {selectedBatch.sumberSekam} (Lot: {selectedBatch.lotSekam})
                  </span>
                </div>
                <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <span className="text-slate-500 font-medium">Lot NaOH</span>
                  <span className="sm:col-span-2 font-semibold text-slate-900">
                    {selectedBatch.lotNaoh} (Molaritas{' '}
                    {selectedBatch.molaritasNaoh})
                  </span>
                </div>
                <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <span className="text-slate-500 font-medium">
                    Rasio Campuran
                  </span>
                  <span className="sm:col-span-2 font-semibold text-slate-900">
                    {selectedBatch.rasioCampuran}
                  </span>
                </div>
                <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <span className="text-slate-500 font-medium">
                    Molaritas NaOH
                  </span>
                  <span className="sm:col-span-2 font-semibold text-slate-900">
                    {selectedBatch.molaritasNaoh}
                  </span>
                </div>
              </div>

              {/* Hasil Uji Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">
                    Hasil Uji
                  </h3>
                  <span className="text-xs text-slate-500 flex items-center gap-1.5">
                    <FileText size={13} className="text-indigo-600" />
                    Berkas Lab: {selectedBatch.ujiLab.lampiranLaporan}
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 border-b border-slate-200/80">
                        <th className="py-3 px-4 font-semibold">Parameter</th>
                        <th className="py-3 px-4 font-semibold">Nilai</th>
                        <th className="py-3 px-4 font-semibold">Ambang</th>
                        <th className="py-3 px-4 font-semibold text-right">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {/* Lindi */}
                      <tr>
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          Lindi
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {selectedBatch.ujiLab.lindi}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">-</td>
                        <td className="py-3.5 px-4 text-right">
                          <StatusBadge
                            status={
                              lindiPass
                                ? 'Lolos'
                                : selectedBatch.ujiLab.lindi === 'Menunggu Uji'
                                ? 'Menunggu'
                                : 'Gagal'
                            }
                            size="sm"
                          />
                        </td>
                      </tr>

                      {/* Kuat Tekan 28 Hari */}
                      <tr>
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          Kuat Tekan 28 Hari
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {ktVal !== null
                            ? `${ktVal.toString().replace('.', ',')} MPa`
                            : 'Menunggu'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {ktVal !== null && ktVal >= 40
                            ? '≥ 40 MPa'
                            : '≥ 40 MPa (A) / ≥ 20 MPa (B)'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <StatusBadge
                            status={
                              ktVal === null
                                ? 'Menunggu'
                                : ktPass
                                ? 'Lolos'
                                : 'Gagal'
                            }
                            size="sm"
                          />
                        </td>
                      </tr>

                      {/* Serapan Air */}
                      <tr>
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          Serapan Air
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {saVal !== null
                            ? `${saVal.toFixed(1).replace('.', ',')}%`
                            : 'Menunggu'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">≤ 3%</td>
                        <td className="py-3.5 px-4 text-right">
                          <StatusBadge
                            status={
                              saVal === null
                                ? 'Menunggu'
                                : saPass
                                ? 'Lolos'
                                : 'Gagal'
                            }
                            size="sm"
                          />
                        </td>
                      </tr>

                      {/* Keausan */}
                      <tr>
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          Keausan
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {kaVal !== null
                            ? `${kaVal.toFixed(3).replace('.', ',')} mm/menit`
                            : 'Menunggu'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          ≤ 0,090 mm/menit
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <StatusBadge
                            status={
                              kaVal === null
                                ? 'Menunggu'
                                : kaPass
                                ? 'Lolos'
                                : 'Gagal'
                            }
                            size="sm"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeDetailTab === 'gerbang' && (
            <div className="space-y-3">
              {evalGates.gerbang.map((g) => (
                <div
                  key={g.nomor}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      {g.nama}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {g.deskripsi}
                    </div>
                    <div className="text-xs font-mono text-indigo-700 mt-1">
                      Aktual: <strong>{g.nilaiAktual}</strong> (Ambang:{' '}
                      {g.ambangBatas})
                    </div>
                  </div>
                  <StatusBadge status={g.status} size="md" />
                </div>
              ))}
            </div>
          )}

          {activeDetailTab === 'riwayat' && (
            <div className="space-y-3">
              {batchLogs.length === 0 ? (
                <div className="text-xs text-slate-500 py-6 text-center">
                  Belum ada catatan perubahan tambahan untuk batch ini.
                </div>
              ) : (
                batchLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <History size={14} className="text-indigo-600" />
                        {log.aksi} — {log.pelaku} ({log.peran})
                      </span>
                      <span className="text-slate-400">{log.waktu}</span>
                    </div>
                    <p className="text-slate-700">{log.ringkasan}</p>
                    {log.alasanKoreksi && (
                      <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 mt-1">
                        <strong>Alasan Koreksi (FR-7):</strong>{' '}
                        {log.alasanKoreksi}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Bottom Eligibility Banner (Matches Center Screen of UI Mockup) */}
          {evalGates.layakJual ? (
            <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80 flex items-center gap-3 text-xs sm:text-sm text-slate-700">
              <Info size={18} className="text-indigo-600 shrink-0" />
              <span>
                Batch ini telah dinyatakan{' '}
                <button
                  onClick={() => onOpenPublicPage(selectedBatch.id)}
                  className="font-bold text-indigo-600 underline hover:text-indigo-800"
                >
                  layak
                </button>{' '}
                dan dapat diakses publik melalui QR.
              </span>
            </div>
          ) : selectedBatch.status === 'Ditolak' ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-xs sm:text-sm text-rose-800">
              <ShieldAlert size={18} className="text-rose-600 shrink-0" />
              <span>
                <strong>Diblokir dari Penjualan (Tujuan MVP #2 & FR-4):</strong>{' '}
                {selectedBatch.alasanStatus}
              </span>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-xs sm:text-sm text-amber-900">
              <Info size={18} className="text-amber-600 shrink-0" />
              <span>{selectedBatch.alasanStatus}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Filter & Paginate Batch List (Matches Top-Right Screen "Kelola Batch" in UI Mockup)
  const filteredBatches = batches.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      b.id.toLowerCase().includes(q) ||
      b.lokasi.toLowerCase().includes(q) ||
      b.operator.toLowerCase().includes(q) ||
      b.sumberFaba.toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === 'Semua' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filteredBatches.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedBatches = filteredBatches.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  return (
    <div className="space-y-5">
      {/* Search Bar & "+ Daftar Batch" Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nomor batch, lokasi, atau operator..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-600 shadow-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 shadow-sm"
          >
            <option value="Semua">Semua Status</option>
            <option value="Mutu A">Mutu A</option>
            <option value="Mutu B">Mutu B</option>
            <option value="Ditolak">Ditolak</option>
            <option value="Menunggu">Menunggu</option>
          </select>
        </div>

        <button
          onClick={() => {
            setFormStep(1);
            setShowNewBatchModal(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-500/20 transition"
        >
          <Plus size={17} />
          Daftar Batch
        </button>
      </div>

      {/* Batch Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 bg-slate-50/60">
                <th className="py-3.5 px-5">No. Batch</th>
                <th className="py-3.5 px-5">Tanggal</th>
                <th className="py-3.5 px-5">Lokasi</th>
                <th className="py-3.5 px-5 hidden md:table-cell">Asal FABA & Sekam</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {paginatedBatches.map((b) => (
                <tr
                  key={b.id}
                  onClick={() => onSelectBatch(b.id)}
                  className="hover:bg-indigo-50/30 transition cursor-pointer"
                >
                  <td className="py-4 px-5 font-bold text-slate-900 font-mono">
                    <div className="flex items-center gap-2">
                      <span>{b.id}</span>
                      {!b.synced && (
                        <span className="px-1.5 py-0.5 text-[10px] rounded bg-amber-100 text-amber-800 font-sans">
                          Luring
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-5 text-slate-600">
                    {b.tanggalDisplay}
                  </td>
                  <td className="py-4 px-5 text-slate-700 font-medium">
                    {b.lokasi}
                  </td>
                  <td className="py-4 px-5 text-slate-500 text-xs hidden md:table-cell">
                    {b.sumberFaba} ({b.lotFaba}) • {b.sumberSekam} ({b.lotSekam})
                  </td>
                  <td className="py-4 px-5">
                    <StatusBadge status={b.status} size="sm" />
                  </td>
                  <td
                    className="py-4 px-5 text-right relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() =>
                        setOpenMenuId(openMenuId === b.id ? null : b.id)
                      }
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                    >
                      <MoreHorizontal size={18} />
                    </button>

                    {openMenuId === b.id && (
                      <div className="absolute right-5 mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 text-left text-xs">
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            onSelectBatch(b.id);
                          }}
                          className="w-full px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2"
                        >
                          <Info size={14} className="text-indigo-600" />
                          Lihat Detail Batch
                        </button>
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            onOpenLabInput(b.id);
                          }}
                          className="w-full px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2"
                        >
                          <FlaskConical size={14} className="text-indigo-600" />
                          Input / Koreksi Uji Lab
                        </button>
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            onOpenQrPage(b.id);
                          }}
                          className="w-full px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2"
                        >
                          <QrCode size={14} className="text-indigo-600" />
                          QR & Cetak Label
                        </button>
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            onOpenPublicPage(b.id);
                          }}
                          className="w-full px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2"
                        >
                          <ExternalLink size={14} className="text-indigo-600" />
                          Buka Halaman Publik
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar (`< 1 2 3 >` matching Top-Right Screen in UI Mockup) */}
        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>

          {[1, 2, 3].map((pageNum) => {
            const isActive = safePage === pageNum;
            return (
              <button
                key={pageNum}
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, pageNum))
                }
                className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                  isActive
                    ? 'bg-[#4F46E5] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Modal: Daftar Batch Baru (Matches Middle-Left Screen in UI Mockup) */}
      {showNewBatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Daftar Batch Baru
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Isi informasi batch dan asal bahan yang digunakan.
                </p>
              </div>
              <button
                onClick={() => setShowNewBatchModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitNewBatch} className="mt-5 space-y-6">
              {formStep === 1 ? (
                <>
                  {/* Section 1: Identitas Batch */}
                  <div className="space-y-3.5">
                    <h3 className="text-sm font-bold text-slate-900">
                      1. Identitas Batch
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                          Nomor Batch{' '}
                          <span className="text-slate-400 font-normal">
                            (otomatis)
                          </span>
                        </label>
                        <input
                          type="text"
                          value={defaultNextId}
                          readOnly
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs sm:text-sm font-mono font-bold text-slate-700 cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                          Tanggal Produksi
                        </label>
                        <input
                          type="date"
                          value={tanggalProduksi}
                          onChange={(e) => setTanggalProduksi(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-600"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                          Lokasi Produksi
                        </label>
                        <select
                          value={lokasiProduksi}
                          onChange={(e) => setLokasiProduksi(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-600"
                        >
                          <option value="Bengkulu">Bengkulu</option>
                          <option value="Mukomuko">Mukomuko</option>
                          <option value="Kaur">Kaur</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                          Operator
                        </label>
                        <input
                          type="text"
                          value={operatorName}
                          onChange={(e) => setOperatorName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-600"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Asal Bahan */}
                  <div className="space-y-3.5 pt-2 border-t border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900">
                      2. Asal Bahan
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                          Sumber FABA
                        </label>
                        <input
                          type="text"
                          value={sumberFaba}
                          onChange={(e) => setSumberFaba(e.target.value)}
                          placeholder="Contoh: PLTU Tanjung Jati"
                          list="faba-sources"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-600"
                          required
                        />
                        <datalist id="faba-sources">
                          <option value="PLTU Tanjung Jati" />
                          <option value="PLTU Teluk Sepang" />
                          <option value="PLTU Suralaya" />
                        </datalist>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                          Lot FABA
                        </label>
                        <input
                          type="text"
                          value={lotFaba}
                          onChange={(e) => setLotFaba(e.target.value)}
                          placeholder="Contoh: F-001"
                          list="faba-lots"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-600"
                          required
                        />
                        <datalist id="faba-lots">
                          {materials
                            .filter((m) => m.jenis.includes('FABA'))
                            .map((m) => (
                              <option key={m.id} value={m.kodeLot}>
                                {m.sumber}
                              </option>
                            ))}
                        </datalist>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                          Sumber Sekam
                        </label>
                        <input
                          type="text"
                          value={sumberSekam}
                          onChange={(e) => setSumberSekam(e.target.value)}
                          placeholder="Contoh: Desa Suka Maju"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-600"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                          Lot Sekam
                        </label>
                        <input
                          type="text"
                          value={lotSekam}
                          onChange={(e) => setLotSekam(e.target.value)}
                          placeholder="Contoh: S-001"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-600"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                          Lot NaOH
                        </label>
                        <input
                          type="text"
                          value={lotNaoh}
                          onChange={(e) => setLotNaoh(e.target.value)}
                          placeholder="Contoh: N-001"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-600"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                          Rasio Campuran (fly ash : aktivator)
                        </label>
                        <input
                          type="text"
                          value={rasioCampuran}
                          onChange={(e) => setRasioCampuran(e.target.value)}
                          placeholder="Contoh: 70 : 30"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-600"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                          Molaritas NaOH
                        </label>
                        <input
                          type="text"
                          value={molaritasNaoh}
                          onChange={(e) => setMolaritasNaoh(e.target.value)}
                          placeholder="Contoh: 12 M"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-600"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Step 2: Konfirmasi & Opsional Input Uji Lab Awal */
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80 text-xs space-y-1">
                    <div className="font-bold text-indigo-950">
                      Ringkasan Batch {defaultNextId} ({lokasiProduksi})
                    </div>
                    <div className="text-indigo-800">
                      FABA: {sumberFaba} ({lotFaba}) • Sekam: {sumberSekam} (
                      {lotSekam}) • NaOH: {lotNaoh} ({molaritasNaoh}) • Rasio:{' '}
                      {rasioCampuran}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeLabNow}
                        onChange={(e) => setIncludeLabNow(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600"
                      />
                      Sertakan Hasil Uji Laboratorium Sekarang (Atau kosongkan
                      jika masih Menunggu Uji 28 Hari)
                    </label>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Hasil Uji Lindi FABA (Gerbang 1 — Sebelum Pencampuran)
                      </label>
                      <select
                        value={quickLindi}
                        onChange={(e) =>
                          setQuickLindi(
                            e.target.value as
                              | 'Tidak terdeteksi'
                              | 'Menunggu Uji'
                              | 'Melebihi Ambang (Gagal)'
                          )
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm"
                      >
                        <option value="Tidak terdeteksi">
                          Tidak terdeteksi (Aman / Lolos Gerbang 1)
                        </option>
                        <option value="Menunggu Uji">Menunggu Uji Lindi</option>
                        <option value="Melebihi Ambang (Gagal)">
                          Melebihi Ambang (Gagal — Batch Otomatis Ditolak)
                        </option>
                      </select>
                    </div>

                    {includeLabNow &&
                      quickLindi !== 'Melebihi Ambang (Gagal)' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                              Kuat Tekan 28 Hari (MPa)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={quickKuatTekan}
                              onChange={(e) =>
                                setQuickKuatTekan(e.target.value)
                              }
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm"
                            />
                            <span className="text-[10px] text-slate-400">
                              ≥40 Mutu A | ≥20 Mutu B
                            </span>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                              Serapan Air (%)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={quickSerapanAir}
                              onChange={(e) =>
                                setQuickSerapanAir(e.target.value)
                              }
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm"
                            />
                            <span className="text-[10px] text-slate-400">
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
                              value={quickKeausan}
                              onChange={(e) => setQuickKeausan(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm"
                            />
                            <span className="text-[10px] text-slate-400">
                              Ambang: ≤ 0,090 mm/mnt
                            </span>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* Footer Buttons (`Batal` & `Selanjutnya ->`) */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (formStep === 2) {
                      setFormStep(1);
                    } else {
                      setShowNewBatchModal(false);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs sm:text-sm font-semibold text-slate-600 transition"
                >
                  {formStep === 2 ? 'Kembali' : 'Batal'}
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-500/20 transition"
                >
                  {formStep === 1 ? (
                    <>
                      Selanjutnya <ArrowRight size={15} />
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} /> Simpan & Evaluasi Gerbang
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
