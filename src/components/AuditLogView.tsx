import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  History,
  UserCheck,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { AuditLogEntry } from '../types';

interface AuditLogViewProps {
  auditLogs: AuditLogEntry[];
  onSelectBatch: (batchId: string) => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({
  auditLogs,
  onSelectBatch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('Semua');

  const filteredLogs = auditLogs.filter((l) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      l.batchId.toLowerCase().includes(q) ||
      l.pelaku.toLowerCase().includes(q) ||
      l.ringkasan.toLowerCase().includes(q) ||
      (l.alasanKoreksi || '').toLowerCase().includes(q);
    const matchesAction =
      actionFilter === 'Semua' || l.aksi === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Audit Log Ketertelusuran (FR-7)
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Rekam jejak permanen (append-only). Data uji tidak dapat dihapus,
            hanya dikoreksi dengan catatan alasan.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <ShieldCheck size={16} className="text-emerald-600" />
          Integritas Log Terkunci (Immutable)
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nomor batch, pelaku, atau alasan koreksi..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 shadow-sm"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 shadow-sm"
        >
          <option value="Semua">Semua Jenis Aktivitas</option>
          <option value="Pendaftaran Batch">Pendaftaran Batch</option>
          <option value="Input Uji Lindi">Input Uji Lindi</option>
          <option value="Input Uji 28 Hari">Input Uji 28 Hari</option>
          <option value="Koreksi Data Uji">Koreksi Data Uji (FR-7)</option>
          <option value="Kunci Batch">Kunci Batch</option>
          <option value="Cetak QR">Cetak QR</option>
          <option value="Sinkronisasi Luring">Sinkronisasi Luring (FR-8)</option>
        </select>
      </div>

      {/* Audit Log Timeline Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm divide-y divide-slate-100">
        {filteredLogs.map((log) => {
          const isCorrection = log.aksi === 'Koreksi Data Uji';
          const isLock = log.aksi === 'Kunci Batch';
          return (
            <div
              key={log.id}
              className="p-5 hover:bg-slate-50/70 transition space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      isCorrection
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : isLock
                        ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                        : 'bg-slate-100 text-slate-800 border border-slate-200'
                    }`}
                  >
                    {log.aksi}
                  </span>
                  <button
                    onClick={() => onSelectBatch(log.batchId)}
                    className="font-mono font-bold text-xs sm:text-sm text-indigo-600 hover:underline"
                  >
                    {log.batchId}
                  </button>
                  <span className="text-xs text-slate-400">• {log.id}</span>
                </div>

                <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <History size={13} className="text-slate-400" />
                  {log.waktu}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {log.ringkasan}
              </p>

              {(log.dataSebelumnya || log.dataBaru) && (
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                  {log.dataSebelumnya && (
                    <span className="text-slate-500">
                      Sebelum: <strong>{log.dataSebelumnya}</strong>
                    </span>
                  )}
                  {log.dataSebelumnya && log.dataBaru && (
                    <ArrowRight size={13} className="text-slate-400" />
                  )}
                  {log.dataBaru && (
                    <span className="text-indigo-700">
                      Sesudah: <strong>{log.dataBaru}</strong>
                    </span>
                  )}
                </div>
              )}

              {log.alasanKoreksi && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
                  <strong>Catatan Alasan Koreksi (Wajib FR-7):</strong>{' '}
                  {log.alasanKoreksi}
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span className="flex items-center gap-1.5">
                  <UserCheck size={13} className="text-indigo-600" />
                  Pelaku: <strong>{log.pelaku}</strong> ({log.peran})
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Lock size={11} /> Tidak dapat dihapus
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
