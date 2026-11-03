import { BatchStatus, LabTestResult } from '../types';

export interface GateCheckItem {
  nomor: number;
  nama: string;
  deskripsi: string;
  nilaiAktual: string;
  ambangBatas: string;
  status: 'Lolos' | 'Gagal' | 'Menunggu';
}

export interface GateEvaluationResult {
  status: BatchStatus;
  alasanStatus: string;
  layakJual: boolean;
  mutuSni: string;
  gerbang: GateCheckItem[];
}

/**
 * Evaluasi otomatis 5 Gerbang Keputusan sesuai PRD FR-4 & Esai GEOPAVE-SEKAM:
 * - Uji Lindi: Harus 'Tidak terdeteksi' (di bawah ambang TCLP). Jika gagal -> langsung Ditolak.
 * - Kuat Tekan 28 Hari: >= 40 MPa untuk Mutu A, >= 20 MPa untuk Mutu B.
 * - Serapan Air: <= 3,0%
 * - Keausan: <= 0,090 mm/menit
 */
export function evaluateBatchGates(
  ujiLab: LabTestResult,
  rasioCampuran: string = '70 : 30',
  molaritasNaoh: string = '12 M',
  lotSekam: string = 'S-002'
): GateEvaluationResult {
  // Gerbang 1: Uji Lindi FABA (sebelum pencampuran)
  const g1Status: 'Lolos' | 'Gagal' | 'Menunggu' =
    ujiLab.lindi === 'Tidak terdeteksi'
      ? 'Lolos'
      : ujiLab.lindi === 'Melebihi Ambang (Gagal)'
      ? 'Gagal'
      : 'Menunggu';

  // Gerbang 2: Aktivator Silika Sekam Padi & Formulasi Geopolimer
  const g2Status: 'Lolos' | 'Gagal' | 'Menunggu' =
    rasioCampuran.trim() !== '' && molaritasNaoh.trim() !== '' && lotSekam.trim() !== ''
      ? 'Lolos'
      : 'Menunggu';

  // Gerbang 3: Kuat Tekan 28 Hari
  let g3Status: 'Lolos' | 'Gagal' | 'Menunggu' = 'Menunggu';
  let g3Label = 'Menunggu uji 28 hari';
  if (ujiLab.kuatTekan !== null) {
    g3Label = `${ujiLab.kuatTekan.toString().replace('.', ',')} MPa`;
    g3Status = ujiLab.kuatTekan >= 20 ? 'Lolos' : 'Gagal';
  }

  // Gerbang 4: Serapan Air & Keausan
  let g4Status: 'Lolos' | 'Gagal' | 'Menunggu' = 'Menunggu';
  let g4Label = 'Menunggu uji fisik';
  if (ujiLab.serapanAir !== null && ujiLab.keausan !== null) {
    const serapanOk = ujiLab.serapanAir <= 3.0;
    const keausanOk = ujiLab.keausan <= 0.09;
    g4Status = serapanOk && keausanOk ? 'Lolos' : 'Gagal';
    g4Label = `Serapan ${ujiLab.serapanAir.toFixed(1).replace('.', ',')}% | Aus ${ujiLab.keausan.toFixed(3).replace('.', ',')} mm/mnt`;
  }

  // Penentuan Status Akhir Batch (FR-4)
  let status: BatchStatus = 'Menunggu';
  let alasanStatus = 'Menunggu penyelesaian uji laboratorium 28 hari.';
  let layakJual = false;
  let mutuSni = 'Belum Ditetapkan';

  if (ujiLab.lindi === 'Melebihi Ambang (Gagal)') {
    status = 'Ditolak';
    alasanStatus =
      'Batch ditolak pada Gerbang 1: Hasil uji lindi (TCLP) melebihi ambang baku mutu. Batch dilarang diproduksi atau diedarkan.';
    layakJual = false;
    mutuSni = 'Tidak Memenuhi (Gagal Uji Lindi)';
  } else if (
    ujiLab.lindi === 'Menunggu Uji' ||
    ujiLab.kuatTekan === null ||
    ujiLab.serapanAir === null ||
    ujiLab.keausan === null
  ) {
    status = 'Menunggu';
    alasanStatus =
      'Menunggu kelengkapan input hasil uji laboratorium 28 hari (Kuat Tekan, Serapan Air, dan Keausan).';
    layakJual = false;
    mutuSni = 'Menunggu Verifikasi Lab';
  } else {
    const kegagalan: string[] = [];
    if (ujiLab.kuatTekan < 20) {
      kegagalan.push(`Kuat tekan (${ujiLab.kuatTekan} MPa) di bawah batas minimum Mutu B (20 MPa)`);
    }
    if (ujiLab.serapanAir > 3.0) {
      kegagalan.push(`Serapan air (${ujiLab.serapanAir.toFixed(1).replace('.', ',')}%) melebihi batas maksimum 3%`);
    }
    if (ujiLab.keausan > 0.09) {
      kegagalan.push(`Keausan (${ujiLab.keausan.toFixed(3).replace('.', ',')} mm/menit) melebihi batas maksimum 0,090 mm/menit`);
    }

    if (kegagalan.length > 0) {
      status = 'Ditolak';
      alasanStatus = `Batch ditolak dan tidak layak jual: ${kegagalan.join('; ')}.`;
      layakJual = false;
      mutuSni = 'Tidak Memenuhi SNI 03-0691-1996';
    } else if (ujiLab.kuatTekan >= 40) {
      status = 'Mutu A';
      alasanStatus =
        'Batch telah dinyatakan layak (Lolos Mutu A: Kuat tekan ≥ 40 MPa, Serapan air ≤ 3%, Keausan ≤ 0,090 mm/menit, Lindi aman) dan dapat diakses publik melalui QR.';
      layakJual = true;
      mutuSni = 'SNI 03-0691-1996 (Mutu A)';
    } else {
      status = 'Mutu B';
      alasanStatus =
        'Batch telah dinyatakan layak (Lolos Mutu B: Kuat tekan ≥ 20 MPa, Serapan air ≤ 3%, Keausan ≤ 0,090 mm/menit, Lindi aman) dan dapat diakses publik melalui QR.';
      layakJual = true;
      mutuSni = 'SNI 03-0691-1996 (Mutu B)';
    }
  }

  // Gerbang 5: Ketertelusuran & Publikasi QR
  const g5Status: 'Lolos' | 'Gagal' | 'Menunggu' =
    status === 'Mutu A' || status === 'Mutu B'
      ? 'Lolos'
      : status === 'Ditolak'
      ? 'Gagal'
      : 'Menunggu';

  const gerbang: GateCheckItem[] = [
    {
      nomor: 1,
      nama: 'Gerbang 1: Uji Lindi FABA',
      deskripsi: 'Pengujian TCLP logam berat sebelum pencampuran bahan',
      nilaiAktual: ujiLab.lindi,
      ambangBatas: 'Tidak terdeteksi (< Baku Mutu PP 22/2021)',
      status: g1Status,
    },
    {
      nomor: 2,
      nama: 'Gerbang 2: Aktivator Silika Sekam & Pencampuran',
      deskripsi: 'Verifikasi rasio fly ash : aktivator silika sekam & molaritas NaOH',
      nilaiAktual: `Rasio ${rasioCampuran} | NaOH ${molaritasNaoh}`,
      ambangBatas: 'Tercatata & Terverifikasi Lot',
      status: g2Status,
    },
    {
      nomor: 3,
      nama: 'Gerbang 3: Kuat Tekan 28 Hari',
      deskripsi: 'Pengujian kuat tekan beton geopolimer pasca curing 28 hari',
      nilaiAktual: g3Label,
      ambangBatas: '≥ 40 MPa (Mutu A) / ≥ 20 MPa (Mutu B)',
      status: g3Status,
    },
    {
      nomor: 4,
      nama: 'Gerbang 4: Serapan Air & Ketahanan Aus',
      deskripsi: 'Uji durabilitas pori dan gesekan permukaan paving',
      nilaiAktual: g4Label,
      ambangBatas: 'Serapan ≤ 3% & Keausan ≤ 0,090 mm/mnt',
      status: g4Status,
    },
    {
      nomor: 5,
      nama: 'Gerbang 5: Ketertelusuran & Sertifikasi QR',
      deskripsi: 'Penerbitan QR Code sisi samping paving & palet untuk publik',
      nilaiAktual: layakJual ? `Aktif (${status})` : status === 'Ditolak' ? 'Diblokir (Tidak Layak Jual)' : 'Menunggu Gerbang 1-4',
      ambangBatas: 'Seluruh Gerbang 1–4 Lolos',
      status: g5Status,
    },
  ];

  return {
    status,
    alasanStatus,
    layakJual,
    mutuSni,
    gerbang,
  };
}

export function formatIndonesianDate(isoDate: string): string {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
  ];
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return `${day} ${months[monthIdx] || parts[1]} ${year}`;
}
