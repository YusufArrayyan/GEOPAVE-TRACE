import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Box,
  Database,
  FlaskConical,
  QrCode,
  FileBarChart2,
  ClipboardList,
  Bell,
  Calendar,
  Wifi,
  WifiOff,
  RefreshCw,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import {
  AuditLogEntry,
  BatchRecord,
  MaterialLot,
  UserAccount,
} from './types';
import {
  DEMO_USERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_BATCHES,
  INITIAL_MATERIALS,
} from './data/initialData';
import { GeopaveLogo } from './components/BrandAssets';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { BatchManagementView } from './components/BatchManagementView';
import { MaterialsView } from './components/MaterialsView';
import { LabTestingView } from './components/LabTestingView';
import { QrAndPublishView } from './components/QrAndPublishView';
import { ReportsView } from './components/ReportsView';
import { AuditLogView } from './components/AuditLogView';
import { PublicTraceView } from './components/PublicTraceView';
import { evaluateBatchGates } from './utils/gateEvaluator';

type NavMenu =
  | 'dashboard'
  | 'batch'
  | 'bahan'
  | 'uji'
  | 'qr'
  | 'laporan'
  | 'audit';

const STORAGE_KEYS = {
  BATCHES: 'geopave_trace_batches_v1',
  MATERIALS: 'geopave_trace_materials_v1',
  LOGS: 'geopave_trace_audit_logs_v1',
};

export function App() {
  // Load persisted data or fallback to initial data matching the UI mockup
  const [batches, setBatches] = useState<BatchRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BATCHES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_BATCHES;
  });

  const [materials, setMaterials] = useState<MaterialLot[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MATERIALS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_MATERIALS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_AUDIT_LOGS;
  });

  // Persist to localStorage (Supports FR-8 Offline Mode persistence)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(batches));
    } catch (e) {
      console.error(e);
    }
  }, [batches]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
    } catch (e) {
      console.error(e);
    }
  }, [materials]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(auditLogs));
    } catch (e) {
      console.error(e);
    }
  }, [auditLogs]);

  // Check URL query parameter `?batch=GP-2026-012` for direct QR scan opening
  const [publicBatchId, setPublicBatchId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('batch');
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isPublicOnlySession, setIsPublicOnlySession] =
    useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserAccount>(DEMO_USERS[0]);
  const [activeMenu, setActiveMenu] = useState<NavMenu>('dashboard');
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [qrSelectedBatchId, setQrSelectedBatchId] =
    useState<string>('GP-2026-012');
  const [labSelectedBatchId, setLabSelectedBatchId] =
    useState<string>('GP-2026-012');
  const [showNewBatchModal, setShowNewBatchModal] = useState<boolean>(false);

  // FR-8 Offline mode simulation & synchronization state
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [showRoleMenu, setShowRoleMenu] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  const unsyncedCount = batches.filter((b) => !b.synced).length;

  const appendAuditLog = (
    entry: Omit<AuditLogEntry, 'id' | 'waktu' | 'tanggalFilter'>
  ) => {
    const now = new Date();
    const timeStr = `2 Nov 2026, ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')} WIB`;
    const newLog: AuditLogEntry = {
      ...entry,
      id: `LOG-2026-${String(auditLogs.length + 13).padStart(4, '0')}`,
      waktu: timeStr,
      tanggalFilter: '2026-11-02',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleCreateBatch = (newBatch: BatchRecord) => {
    const batchWithSync: BatchRecord = {
      ...newBatch,
      synced: !isOfflineMode,
    };
    setBatches((prev) => [batchWithSync, ...prev]);
    appendAuditLog({
      batchId: newBatch.id,
      pelaku: currentUser.nama,
      peran: currentUser.labelPeran,
      aksi: 'Pendaftaran Batch',
      ringkasan: `Mendaftarkan batch ${newBatch.id} di lokasi ${newBatch.lokasi} (FABA: ${newBatch.sumberFaba} Lot ${newBatch.lotFaba}, Sekam: ${newBatch.sumberSekam} Lot ${newBatch.lotSekam}).${
        isOfflineMode ? ' [Disimpan dalam antrean Mode Luring]' : ''
      }`,
      dataBaru: `Status Awal: ${newBatch.status}`,
    });
  };

  const handleSaveLabTest = (
    batchId: string,
    updatedLab: BatchRecord['ujiLab'],
    alasanKoreksi?: string
  ) => {
    const target = batches.find((b) => b.id === batchId);
    if (!target) return;

    const evalResult = evaluateBatchGates(
      updatedLab,
      target.rasioCampuran,
      target.molaritasNaoh,
      target.lotSekam
    );

    const prevSummary = `Lindi: ${target.ujiLab.lindi}, Kuat Tekan: ${
      target.ujiLab.kuatTekan ?? '-'
    } MPa, Serapan: ${target.ujiLab.serapanAir ?? '-'}%, Aus: ${
      target.ujiLab.keausan ?? '-'
    }`;
    const newSummary = `Lindi: ${updatedLab.lindi}, Kuat Tekan: ${
      updatedLab.kuatTekan ?? '-'
    } MPa, Serapan: ${updatedLab.serapanAir ?? '-'}%, Aus: ${
      updatedLab.keausan ?? '-'
    } -> Status: ${evalResult.status}`;

    setBatches((prev) =>
      prev.map((b) =>
        b.id === batchId
          ? {
              ...b,
              ujiLab: updatedLab,
              status: evalResult.status,
              alasanStatus: evalResult.alasanStatus,
              synced: !isOfflineMode,
            }
          : b
      )
    );

    appendAuditLog({
      batchId,
      pelaku: currentUser.nama,
      peran: currentUser.labelPeran,
      aksi: alasanKoreksi ? 'Koreksi Data Uji' : 'Input Uji 28 Hari',
      ringkasan: alasanKoreksi
        ? `Koreksi data hasil uji laboratorium pada batch ${batchId}. Status mutakhir: ${evalResult.status}.`
        : `Input hasil uji laboratorium batch ${batchId}. Sistem menetapkan status otomatis: ${evalResult.status}.`,
      alasanKoreksi,
      dataSebelumnya: prevSummary,
      dataBaru: newSummary,
    });
  };

  const handleToggleLockBatch = (batchId: string) => {
    const target = batches.find((b) => b.id === batchId);
    if (!target) return;
    const nextLocked = !target.terkunci;
    setBatches((prev) =>
      prev.map((b) => (b.id === batchId ? { ...b, terkunci: nextLocked } : b))
    );
    appendAuditLog({
      batchId,
      pelaku: currentUser.nama,
      peran: currentUser.labelPeran,
      aksi: 'Kunci Batch',
      ringkasan: nextLocked
        ? `Mengunci data batch ${batchId} setelah verifikasi audit mutu.`
        : `Membuka kunci batch ${batchId} untuk keperluan koreksi terotorisasi.`,
      dataSebelumnya: `Terkunci: ${target.terkunci ? 'Ya' : 'Tidak'}`,
      dataBaru: `Terkunci: ${nextLocked ? 'Ya' : 'Tidak'}`,
    });
  };

  const handleAddMaterial = (newLot: MaterialLot) => {
    setMaterials((prev) => [newLot, ...prev]);
    appendAuditLog({
      batchId: newLot.kodeLot,
      pelaku: currentUser.nama,
      peran: currentUser.labelPeran,
      aksi: 'Registrasi Lot Bahan',
      ringkasan: `Mendaftarkan lot bahan baku baru ${newLot.kodeLot} (${newLot.jenis}) dari ${newLot.sumber}.`,
      dataBaru: `${newLot.kodeLot} — ${newLot.volumeStok}`,
    });
  };

  const handleLogQrPrint = (batchId: string, format: string) => {
    appendAuditLog({
      batchId,
      pelaku: currentUser.nama,
      peran: currentUser.labelPeran,
      aksi: 'Cetak QR',
      ringkasan: `Mengunduh / mencetak label QR batch ${batchId} (${format}) untuk pemasangan sisi samping paving & palet.`,
    });
  };

  const handleSyncOfflineQueue = () => {
    if (unsyncedCount === 0) {
      setIsOfflineMode(false);
      return;
    }
    setBatches((prev) => prev.map((b) => ({ ...b, synced: true })));
    setIsOfflineMode(false);
    appendAuditLog({
      batchId: 'SYNC-BATCH',
      pelaku: currentUser.nama,
      peran: currentUser.labelPeran,
      aksi: 'Sinkronisasi Luring',
      ringkasan: `Sinkronisasi berhasil: ${unsyncedCount} data batch dari penyimpanan lokal (mode luring FR-8) telah diunggah ke server pusat.`,
    });
  };

  const handleResetDemoData = () => {
    if (
      window.confirm(
        'Kembalikan seluruh data ke kondisi awal (12 Batch sesuai rancangan UI)?'
      )
    ) {
      setBatches(INITIAL_BATCHES);
      setMaterials(INITIAL_MATERIALS);
      setAuditLogs(INITIAL_AUDIT_LOGS);
      setSelectedBatchId(null);
    }
  };

  // 1. If viewing Public QR Trace Page (`?batch=...` or triggered via button)
  if (publicBatchId) {
    const foundBatch =
      batches.find((b) => b.id.toLowerCase() === publicBatchId.toLowerCase()) ||
      batches[0];
    return (
      <PublicTraceView
        batch={foundBatch}
        allBatches={batches}
        onSelectBatch={(id) => {
          setPublicBatchId(id);
          window.history.replaceState({}, '', `/?batch=${id}`);
        }}
        onBackToApp={() => {
          setPublicBatchId(null);
          window.history.replaceState({}, '', '/');
          if (isPublicOnlySession) {
            setIsAuthenticated(false);
          }
        }}
        isPublicOnlySession={isPublicOnlySession}
      />
    );
  }

  // 2. If on Login View
  if (!isAuthenticated) {
    return (
      <LoginView
        onLogin={(user) => {
          setCurrentUser(user);
          setIsPublicOnlySession(false);
          setIsAuthenticated(true);
        }}
        onEnterPublicAuditor={() => {
          setIsPublicOnlySession(true);
          setPublicBatchId('GP-2026-012');
          window.history.replaceState({}, '', '/?batch=GP-2026-012');
        }}
      />
    );
  }

  const menuItems: {
    id: NavMenu;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
    },
    { id: 'batch', label: 'Kelola Batch', icon: <Box size={18} /> },
    { id: 'bahan', label: 'Data Bahan', icon: <Database size={18} /> },
    { id: 'uji', label: 'Hasil Uji', icon: <FlaskConical size={18} /> },
    { id: 'qr', label: 'QR & Publikasi', icon: <QrCode size={18} /> },
    { id: 'laporan', label: 'Laporan', icon: <FileBarChart2 size={18} /> },
    { id: 'audit', label: 'Audit Log', icon: <ClipboardList size={18} /> },
  ];

  const pageTitleMap: Record<NavMenu, string> = {
    dashboard: 'Dashboard',
    batch: selectedBatchId ? `Detail Batch — ${selectedBatchId}` : 'Kelola Batch',
    bahan: 'Data Bahan',
    uji: 'Hasil Uji',
    qr: 'QR & Publikasi',
    laporan: 'Laporan',
    audit: 'Audit Log',
  };

  return (
    <div className="min-h-screen bg-[#F4F6FB] flex">
      {/* Dark Navy Sidebar (Matches `#131836` Sidebar in UI Presentation Board) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#131836] text-white flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 lg:static lg:shrink-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Logo Header */}
          <div className="px-6 py-6 flex items-center justify-between border-b border-white/10">
            <GeopaveLogo variant="dark" size="md" />
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {menuItems.map((item) => {
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveMenu(item.id);
                    if (item.id !== 'batch') {
                      setSelectedBatchId(null);
                    }
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition ${
                    isActive
                      ? 'bg-[#3B41C5] text-white shadow-md shadow-indigo-950/50'
                      : 'text-indigo-200/80 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Public QR Page Shortcut */}
          <div className="px-4 mt-2">
            <button
              onClick={() => {
                setPublicBatchId(selectedBatchId || 'GP-2026-012');
                window.history.replaceState(
                  {},
                  '',
                  `/?batch=${selectedBatchId || 'GP-2026-012'}`
                );
              }}
              className="w-full py-2.5 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-indigo-200 text-xs font-medium flex items-center justify-between transition"
            >
              <span className="flex items-center gap-2">
                <ExternalLink size={14} className="text-indigo-400" />
                Halaman Publik QR
              </span>
              <span className="text-[10px] font-mono bg-indigo-500/30 px-1.5 py-0.5 rounded">
                FR-6
              </span>
            </button>
          </div>
        </div>

        {/* Bottom User Profile & Role Switcher (Matches Bottom-Left of Sidebar in UI Mockup) */}
        <div className="p-4 border-t border-white/10 space-y-3 relative">
          {showRoleMenu && (
            <div className="absolute bottom-24 left-4 right-4 bg-[#1D244D] rounded-xl p-2 border border-indigo-400/30 shadow-2xl space-y-1 z-50">
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 px-2 py-1">
                Ganti Peran Pengguna:
              </div>
              {DEMO_USERS.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setCurrentUser(u);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition ${
                    currentUser.id === u.id
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-indigo-100 hover:bg-white/10'
                  }`}
                >
                  <div>{u.nama}</div>
                  <div className="text-[10px] opacity-75">{u.labelPeran}</div>
                </button>
              ))}
              <div className="border-t border-white/10 pt-1 mt-1 flex items-center justify-between px-1">
                <button
                  onClick={handleResetDemoData}
                  className="text-[11px] text-amber-300 hover:underline flex items-center gap-1 py-1 px-1.5"
                >
                  <RotateCcw size={12} /> Reset Data
                </button>
                <button
                  onClick={() => {
                    setShowRoleMenu(false);
                    setIsAuthenticated(false);
                  }}
                  className="text-[11px] text-rose-300 hover:underline flex items-center gap-1 py-1 px-1.5"
                >
                  <LogOut size={12} /> Keluar
                </button>
              </div>
            </div>
          )}

          <div
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center justify-between gap-2.5 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-400 flex items-center justify-center font-bold text-sm text-white shadow-sm shrink-0 border-2 border-white/20">
                {currentUser.avatarInisial}
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-white truncate">
                  {currentUser.nama}
                </div>
                <div className="text-[11px] text-indigo-300 truncate">
                  {currentUser.labelPeran}
                </div>
              </div>
            </div>
            <ChevronDown size={15} className="text-indigo-300 shrink-0" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar (Matches Top Bar of Dashboard in UI Mockup) */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-4 sticky top-0 z-30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-600"
            >
              <Menu size={18} />
            </button>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              {pageTitleMap[activeMenu]}
            </h1>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* FR-8 Offline Mode Toggle & Sync Status */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsOfflineMode(!isOfflineMode)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  isOfflineMode
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                }`}
                title="Klik untuk simulasi Mode Luring (FR-8: lokasi dengan sinyal lemah)"
              >
                {isOfflineMode ? (
                  <>
                    <WifiOff size={14} className="text-amber-600" />
                    <span className="hidden md:inline">Mode Luring (FR-8)</span>
                  </>
                ) : (
                  <>
                    <Wifi size={14} className="text-emerald-600" />
                    <span className="hidden md:inline">Tersambung</span>
                  </>
                )}
              </button>

              {unsyncedCount > 0 && (
                <button
                  onClick={handleSyncOfflineQueue}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
                >
                  <RefreshCw size={13} />
                  Sinkronkan ({unsyncedCount})
                </button>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-xl bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-50 relative shadow-sm"
              >
                <Bell size={17} />
                <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 text-xs space-y-2.5">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>Notifikasi Sistem Mutu</span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      Tutup
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 space-y-2">
                    {auditLogs.slice(0, 3).map((l) => (
                      <div key={l.id} className="pt-2">
                        <div className="font-semibold text-indigo-700">
                          {l.batchId} — {l.aksi}
                        </div>
                        <p className="text-slate-600 line-clamp-2 mt-0.5">
                          {l.ringkasan}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          {l.waktu}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Date Pill (`2 Nov 2026` matching UI Mockup) */}
            <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 text-xs font-semibold text-slate-700 shadow-sm">
              <Calendar size={15} className="text-indigo-600" />
              <span>2 Nov 2026</span>
            </div>

            {/* Logout / Login Screen View Button */}
            <button
              onClick={() => setIsAuthenticated(false)}
              className="p-2.5 rounded-xl bg-white border border-slate-200/90 text-slate-500 hover:text-rose-600 hover:bg-rose-50/50 transition shadow-sm"
              title="Ke Halaman Login"
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {activeMenu === 'dashboard' && (
            <DashboardView
              user={currentUser}
              batches={batches}
              onSelectBatch={(batchId) => {
                setSelectedBatchId(batchId);
                setActiveMenu('batch');
              }}
              onNavigate={(menu) => setActiveMenu(menu as NavMenu)}
              onOpenNewBatchModal={() => {
                setSelectedBatchId(null);
                setActiveMenu('batch');
                setShowNewBatchModal(true);
              }}
            />
          )}

          {activeMenu === 'batch' && (
            <BatchManagementView
              batches={batches}
              materials={materials}
              auditLogs={auditLogs}
              selectedBatchId={selectedBatchId}
              onSelectBatch={(id) => setSelectedBatchId(id)}
              onCreateBatch={handleCreateBatch}
              onToggleLockBatch={handleToggleLockBatch}
              onOpenQrPage={(batchId) => {
                setQrSelectedBatchId(batchId);
                setActiveMenu('qr');
              }}
              onOpenPublicPage={(batchId) => {
                setPublicBatchId(batchId);
                window.history.replaceState({}, '', `/?batch=${batchId}`);
              }}
              onOpenLabInput={(batchId) => {
                setLabSelectedBatchId(batchId);
                setActiveMenu('uji');
              }}
              currentUser={currentUser}
              showNewBatchModal={showNewBatchModal}
              setShowNewBatchModal={setShowNewBatchModal}
            />
          )}

          {activeMenu === 'bahan' && (
            <MaterialsView
              materials={materials}
              onAddMaterial={handleAddMaterial}
            />
          )}

          {activeMenu === 'uji' && (
            <LabTestingView
              batches={batches}
              selectedBatchId={labSelectedBatchId}
              onSelectBatch={(id) => setLabSelectedBatchId(id)}
              onSaveLabTest={handleSaveLabTest}
              currentUser={currentUser}
            />
          )}

          {activeMenu === 'qr' && (
            <QrAndPublishView
              batches={batches}
              selectedBatchId={qrSelectedBatchId}
              onSelectBatch={(id) => setQrSelectedBatchId(id)}
              onOpenPublicPage={(batchId) => {
                setPublicBatchId(batchId);
                window.history.replaceState({}, '', `/?batch=${batchId}`);
              }}
              onLogQrPrint={handleLogQrPrint}
            />
          )}

          {activeMenu === 'laporan' && (
            <ReportsView batches={batches} auditLogs={auditLogs} />
          )}

          {activeMenu === 'audit' && (
            <AuditLogView
              auditLogs={auditLogs}
              onSelectBatch={(batchId) => {
                const exists = batches.some((b) => b.id === batchId);
                if (exists) {
                  setSelectedBatchId(batchId);
                  setActiveMenu('batch');
                }
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
export default App;
