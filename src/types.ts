export type UserRole = 'operator' | 'analis' | 'pemasok' | 'admin' | 'publik';

export type BatchStatus = 'Mutu A' | 'Mutu B' | 'Ditolak' | 'Menunggu';

export type LindiResult = 'Tidak terdeteksi' | 'Melebihi Ambang (Gagal)' | 'Menunggu Uji';

export interface LabTestResult {
  lindi: LindiResult;
  lindiDetail: string;
  kuatTekan: number | null; // MPa (Ambang: >= 40 MPa Mutu A, >= 20 MPa Mutu B)
  serapanAir: number | null; // % (Ambang: <= 3.0%)
  keausan: number | null; // mm/menit (Ambang: <= 0.090 mm/menit)
  tanggalUji: string;
  namaLab: string;
  analis: string;
  lampiranLaporan: string;
  catatanKoreksiTerakhir?: string;
}

export interface BatchRecord {
  id: string; // Format: GP-[tahun]-[urut]
  tanggalProduksi: string; // YYYY-MM-DD
  tanggalDisplay: string; // e.g., 28 Okt 2026
  lokasi: string; // e.g., Bengkulu, Mukomuko, Kaur
  unitProduksi: string; // e.g., UMKM Sejahtera Bersama – Bengkulu
  operator: string;
  // Asal Bahan (FR-2)
  sumberFaba: string;
  lotFaba: string;
  sumberSekam: string;
  lotSekam: string;
  lotNaoh: string;
  rasioCampuran: string; // fly ash : aktivator (e.g., 70 : 30)
  molaritasNaoh: string; // e.g., 12 M
  // Hasil Uji (FR-3)
  ujiLab: LabTestResult;
  // Status Gerbang Otomatis (FR-4)
  status: BatchStatus;
  alasanStatus: string;
  terkunci: boolean; // Dikunci oleh Admin/Auditor
  waktuPengisianDetik: number; // Metrik Pilot Bagian 8 (target <= 300 detik / 5 menit)
  synced: boolean; // Mode Luring (FR-8)
  jumlahPavingPalet?: number;
}

export interface MaterialLot {
  id: string;
  jenis: 'FABA (Fly Ash & Bottom Ash)' | 'Sekam Padi (Silika Aktif)' | 'NaOH (Alkali Aktivator)';
  kodeLot: string;
  sumber: string;
  lokasiAsal: string;
  tanggalMasuk: string;
  volumeStok: string;
  spesifikasi: string;
  statusVerifikasi: 'Terverifikasi' | 'Menunggu Uji Lindi' | 'Ditolak';
  pemasok: string;
}

export interface AuditLogEntry {
  id: string;
  waktu: string; // ISO or readable date-time
  tanggalFilter: string; // YYYY-MM-DD
  batchId: string;
  pelaku: string;
  peran: string;
  aksi: 'Pendaftaran Batch' | 'Input Uji Lindi' | 'Input Uji 28 Hari' | 'Koreksi Data Uji' | 'Kunci Batch' | 'Cetak QR' | 'Sinkronisasi Luring' | 'Registrasi Lot Bahan';
  ringkasan: string;
  alasanKoreksi?: string;
  dataSebelumnya?: string;
  dataBaru?: string;
}

export interface UserAccount {
  id: string;
  nama: string;
  username: string;
  email: string;
  peran: UserRole;
  labelPeran: string;
  instansi: string;
  avatarInisial: string;
}
