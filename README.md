# GEOPAVE Trace

**Sistem Ketertelusuran Batch Paving Geopolimer Berlabel QR**  
*Rancangan Pendukung Esai GEOPAVE-SEKAM — Engineer Fest 2026*

<p align="center">
  <img src="public/logo.png" alt="Logo GEOPAVE Trace" width="140" />
</p>

## Tentang Sistem

**GEOPAVE Trace** adalah sistem pencatatan dan ketertelusuran mutu digital per batch untuk produksi *paving block* geopolimer berbasis **Fly Ash & Bottom Ash (FABA)** PLTU dengan aktivator **Silika Sekam Padi** dan **NaOH** (tanpa semen Portland, menekan emisi $\text{CO}_2$ hingga 39% per $\text{m}^2$).

Sistem ini menegakkan **Lima Gerbang Keputusan** kualitas sebelum paving dinyatakan layak edar dan dibeli oleh pemerintah daerah atau kontraktor melalui pemindaian kode QR di sisi samping paving (tinggi 6 cm) maupun pada palet distribusi.

---

## Pemenuhan Kebutuhan Fungsional (PRD GEOPAVE Trace)

| ID | Kebutuhan Fungsional | Implementasi Sistem |
|---|---|---|
| **FR-1** | Daftar batch dengan nomor `GP-[tahun]-[urut]`, tanggal, lokasi, dan operator. | Penomoran otomatis (`GP-2026-001` s/d `GP-2026-013+`), lokasi produksi (`Bengkulu`, `Mukomuko`, `Kaur`), dan identitas operator UMKM. |
| **FR-2** | Catat asal bahan: sumber dan lot FABA, sumber sekam, lot NaOH. | Modul **Data Bahan** dan formulir **Daftar Batch Baru** mencatat sumber/lot FABA PLTU, sekam desa mitra, lot NaOH, rasio campuran (`70 : 30`), serta molaritas NaOH (`12 M`). |
| **FR-3** | Input hasil uji: lindi, kuat tekan 28 hari, serapan air, keausan, dengan lampiran laporan lab. | Modul **Hasil Uji** oleh Analis Laboratorium Kampus lengkap dengan unggah nama berkas PDF Laporan Hasil Uji (LHU). |
| **FR-4** | Status gerbang otomatis (`Menunggu`, `Mutu A`, `Mutu B`, `Ditolak`) memakai ambang SNI. | Mesin evaluator otomatis (`src/utils/gateEvaluator.ts`): Kuat tekan $\ge 40\text{ MPa}$ (**Mutu A**) atau $\ge 20\text{ MPa}$ (**Mutu B**), serapan air $\le 3\%$, keausan $\le 0,090\text{ mm/menit}$. Batch dengan lindi gagal otomatis ditandai **Ditolak** dan dikunci dari status layak jual. |
| **FR-5** | Buat QR per batch yang membuka halaman publik; QR dipasang di sisi samping paving dan palet. | Modul **QR & Publikasi** menghasilkan QR Code nyata yang dapat diunduh dalam format **PNG**, **SVG**, maupun **Cetak Label** (ukuran sisi samping 6 cm dan label palet). |
| **FR-6** | Halaman publik tanpa login: asal bahan, status uji, mutu SNI, tanggal produksi. | Halaman publik ringan (`/?batch=GP-2026-012`) dengan mode tampilan **Kartu Web** dan **Simulasi Layar Smartphone Pembeli**. |
| **FR-7** | Log audit: data uji tidak dapat dihapus, hanya dikoreksi dengan catatan alasan. | Modul **Audit Log** bersifat *append-only* (tanpa tombol hapus). Setiap koreksi nilai uji wajib menyertakan alasan koreksi yang terekam bersama nilai sebelum dan sesudah. |
| **FR-8** | Mode luring untuk lokasi dengan sinyal lemah, disinkronkan saat tersambung. | Penyimpanan lokal otomatis (`localStorage`) dengan simulator **Mode Luring (FR-8)** dan tombol **Sinkronkan** di bilah atas. |
| **FR-9** | Ekspor laporan batch (PDF atau CSV) untuk pengadaan dan audit. | Modul **Laporan** mendukung filter periode tanggal, lokasi, pilihan bagian laporan, serta unduhan berkas **CSV** dan cetak dokumen **PDF**. |

---

## Cara Menjalankan Secara Lokal

1. Instal dependensi:
   ```bash
   npm install
   ```
2. Jalankan server pengembangan:
   ```bash
   npm run dev
   ```
3. Bangun untuk produksi:
   ```bash
   npm run build
   ```
