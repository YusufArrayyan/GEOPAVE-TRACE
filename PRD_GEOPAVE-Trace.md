# PRD: GEOPAVE Trace

*Sistem ketertelusuran batch paving geopolimer berlabel QR (rancangan
pendukung esai GEOPAVE-SEKAM, Engineer Fest 2026)*

-   **Status:** draf konsep v0.1, belum dibangun.
-   **Tanggal:** 2 November 2026.
-   **Catatan:** Semua angka target adalah asumsi desain yang divalidasi
    pada tahap pilot.

## 1. Masalah dan Tujuan

Esai menetapkan lima gerbang keputusan (kuat tekan, aktivator sekam, uji
lindi, serapan air dan keausan, ketertelusuran). Gerbang itu tidak bisa
ditegakkan tanpa pencatatan per batch, dan pembeli seperti pemerintah
daerah tidak punya cara memeriksa mutu paving yang mereka beli. GEOPAVE
Trace menyediakan satu catatan digital per batch yang dibuka lewat QR.

Tujuan MVP:

1.  Setiap batch punya asal bahan, hasil uji, dan status mutu yang bisa
    diperiksa publik.
2.  Batch yang gagal uji tidak dapat diberi status layak jual.
3.  Operator UMKM dapat mengisi data tanpa pelatihan panjang.

## 2. Pengguna

  -----------------------------------------------------------------------
  Peran                               Kebutuhan utama
  ----------------------------------- -----------------------------------
  Operator UMKM                       Mendaftarkan batch, mencatat bahan
                                      dan proses, mencetak label QR.

  Analis laboratorium kampus          Memasukkan hasil uji lindi, kuat
                                      tekan 28 hari, serapan air, dan
                                      keausan beserta berkas laporan.

  Pemasok FABA dan sekam              Menyediakan asal dan nomor lot
                                      bahan.

  Pembeli (pemda, kontraktor)         Memindai QR dan melihat status mutu
                                      tanpa membuat akun.

  Admin atau auditor                  Meninjau data, mengunci batch,
                                      mengekspor laporan.
  -----------------------------------------------------------------------

## 3. Ruang Lingkup

### Dalam MVP

-   Pendaftaran batch, pencatatan asal bahan, input hasil uji, status
    gerbang otomatis.
-   Pembuatan QR dan halaman publik hanya-baca per batch.

### Di luar MVP

-   Pembayaran, marketplace, aplikasi seluler asli, integrasi langsung
    ke sistem PLN.

## 4. Kebutuhan Fungsional

  -----------------------------------------------------------------------
  ID                      Kebutuhan               Prioritas
  ----------------------- ----------------------- -----------------------
  FR-1                    Daftar batch dengan     P0
                          nomor                   
                          `GP-[tahun]-[urut]`,    
                          tanggal, lokasi, dan    
                          operator.               

  FR-2                    Catat asal bahan:       P0
                          sumber dan lot FABA,    
                          sumber sekam, lot NaOH. 

  FR-3                    Input hasil uji: lindi, P0
                          kuat tekan 28 hari,     
                          serapan air, keausan,   
                          dengan lampiran laporan 
                          lab.                    

  FR-4                    Status gerbang otomatis P0
                          (menunggu, lolos,       
                          gagal) memakai ambang:  
                          kuat tekan 40 MPa untuk 
                          mutu A atau 20 MPa      
                          untuk mutu B, serapan   
                          air 3%, keausan 0,090   
                          mm/menit. Batch dengan  
                          lindi gagal ditandai    
                          ditolak.                

  FR-5                    Buat QR per batch yang  P0
                          membuka halaman publik; 
                          QR dipasang di sisi     
                          samping paving dan pada 
                          palet.                  

  FR-6                    Halaman publik tanpa    P0
                          login: asal bahan,      
                          status uji, mutu SNI,   
                          tanggal produksi.       

  FR-7                    Log audit: data uji     P1
                          tidak dapat dihapus,    
                          hanya dikoreksi dengan  
                          catatan alasan.         

  FR-8                    Mode luring untuk       P1
                          lokasi dengan sinyal    
                          lemah, disinkronkan     
                          saat tersambung.        

  FR-9                    Ekspor laporan batch    P2
                          (PDF atau CSV) untuk    
                          pengadaan dan audit.    
  -----------------------------------------------------------------------

## 5. Data per Batch

  -----------------------------------------------------------------------
  Kelompok                            Isian
  ----------------------------------- -----------------------------------
  Identitas                           Nomor batch, tanggal, lokasi
                                      produksi, operator.

  Bahan                               Sumber dan lot FABA, sumber sekam,
                                      lot NaOH, rasio campuran (fly ash :
                                      aktivator), molaritas NaOH.

  Hasil uji                           Lindi, kuat tekan 28 hari (MPa),
                                      serapan air (%), keausan
                                      (mm/menit), tanggal dan nama
                                      laboratorium.

  Status                              Menunggu, lolos mutu A, lolos mutu
                                      B, atau ditolak, beserta alasan.
  -----------------------------------------------------------------------

## 6. Alur Utama

1.  Operator mendaftarkan batch dan mengisi asal bahan.
2.  Analis lab mengunggah hasil uji lindi FABA sebelum pencampuran; bila
    gagal, batch ditolak.
3.  Produksi dan curing; analis memasukkan hasil uji 28 hari.
4.  Sistem menetapkan status; batch layak dicetak QR-nya.
5.  Pembeli memindai QR dan melihat halaman publik.

## 7. Kebutuhan Nonfungsional

-   Halaman publik ringan agar terbuka pada sinyal seluler lemah.
-   Peran dan autentikasi untuk operator, analis, dan admin; halaman
    publik tidak memuat data pribadi.
-   Integritas data: setiap perubahan tercatat dengan waktu dan pelaku.

## 8. Metrik Keberhasilan Pilot

*Target berikut merupakan asumsi desain.*

  Metrik                                                              Target
  ---------------------------------------------------- ---------------------
  Batch yang terbaca lewat QR                                           100%
  Batch dengan hasil uji lindi sebelum produksi                         100%
  Batch dengan hasil kuat tekan 28 hari terpublikasi                    100%
  Waktu pengisian data per batch oleh operator           5 menit atau kurang

## 9. Risiko dan Pertanyaan Terbuka

-   QR di permukaan paving akan aus; karena itu QR ditempatkan di sisi
    samping dan palet. Daya tahan cetakan atau ukiran QR pada beton
    geopolimer perlu diuji.
-   Operator UMKM mungkin tidak disiplin mengisi data; perlu pelatihan
    dan audit berkala.
-   Keterlambatan laporan laboratorium dapat menahan penjualan batch.
-   Belum ditetapkan siapa yang mengelola server dan biaya hostingnya
    setelah pilot (kandidat: perguruan tinggi mitra).
-   Pilihan teknis (aplikasi web progresif, basis data) ditentukan pada
    tahap desain; PRD ini tidak mengikatnya.

## 10. Rencana Rilis (Selaras Gantt Esai)

  -----------------------------------------------------------------------
  Bulan                               Kegiatan
  ----------------------------------- -----------------------------------
  1 sampai 6                          Definisi data, prototipe berbasis
                                      formulir dan halaman statis, uji
                                      dengan data laboratorium.

  7 sampai 12                         Pilot MVP di satu UMKM mitra; ukur
                                      metrik bagian 8.

  13 sampai 18                        Perluasan ke tiga lokasi PLTU;
                                      tambah mode luring dan ekspor
                                      laporan.

  19 sampai 24                        Penyesuaian format laporan untuk
                                      pengadaan hijau pemerintah daerah.
  -----------------------------------------------------------------------
