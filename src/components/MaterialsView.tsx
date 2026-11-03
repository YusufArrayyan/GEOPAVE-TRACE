import React, { useState } from 'react';
import {
  Factory,
  Leaf,
  FlaskConical,
  Plus,
  CheckCircle2,
  PackageCheck,
  X,
} from 'lucide-react';
import { MaterialLot } from '../types';

interface MaterialsViewProps {
  materials: MaterialLot[];
  onAddMaterial: (lot: MaterialLot) => void;
}

export const MaterialsView: React.FC<MaterialsViewProps> = ({
  materials,
  onAddMaterial,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [jenis, setJenis] = useState<MaterialLot['jenis']>(
    'FABA (Fly Ash & Bottom Ash)'
  );
  const [kodeLot, setKodeLot] = useState('F-005');
  const [sumber, setSumber] = useState('PLTU Tanjung Jati');
  const [lokasiAsal, setLokasiAsal] = useState('Distribusi Regional Bengkulu');
  const [volumeStok, setVolumeStok] = useState('15,0 Ton');
  const [spesifikasi, setSpesifikasi] = useState(
    'Fly Ash Kelas F, Kehalusan Lolos Ayakan #200, TCLP Aman'
  );
  const [pemasok, setPemasok] = useState(
    'Rina Kusuma, S.T. (Unit Pengelola FABA PLTU)'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLot: MaterialLot = {
      id: `MAT-${String(materials.length + 1).padStart(2, '0')}`,
      jenis,
      kodeLot,
      sumber,
      lokasiAsal,
      tanggalMasuk: '2026-11-02',
      volumeStok,
      spesifikasi,
      statusVerifikasi: 'Terverifikasi',
      pemasok,
    };
    onAddMaterial(newLot);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Data Bahan Baku & Lot Pemasok (FR-2)
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Pencatatan asal dan nomor lot FABA PLTU, Silika Sekam Padi, serta
            Aktivator NaOH.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-500/20 transition"
        >
          <Plus size={16} />
          Registrasi Lot Bahan Baru
        </button>
      </div>

      {/* 3 Material Category Cards (Matches Bahan Utama in GEOPAVE-SEKAM Infographic) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Prekursor Utama
            </span>
            <Factory size={18} className="text-indigo-600" />
          </div>
          <div className="text-base font-extrabold text-slate-900">
            Fly Ash & Bottom Ash (FABA)
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Residu pembakaran batubara PLTU kaya aluminosilikat sebagai
            pengganti 100% semen Portland. Wajib lolos Gerbang 1 (Uji Lindi
            TCLP).
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Aktivator Silika Lokal
            </span>
            <Leaf size={18} className="text-emerald-600" />
          </div>
          <div className="text-base font-extrabold text-slate-900">
            Silika Sekam Padi
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Sumber silika amorf reaktif dari limbah pertanian desa mitra untuk
            menggantikan natrium silikat komersial yang mahal.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Aktivator Alkali
            </span>
            <FlaskConical size={18} className="text-amber-600" />
          </div>
          <div className="text-base font-extrabold text-slate-900">
            Larutan NaOH (8 M – 12 M)
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Melarutkan silika sekam padi dan mengaktifkan reaksi polimerisasi
            FABA pada rasio optimum 70 : 30.
          </p>
        </div>
      </div>

      {/* Lots Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <PackageCheck size={17} className="text-indigo-600" />
            Daftar Lot Bahan Baku Terverifikasi
          </h3>
          <span className="text-xs text-slate-500">
            Total: {materials.length} Lot Aktif
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200/80 text-xs">
                <th className="py-3.5 px-5">Kode Lot</th>
                <th className="py-3.5 px-5">Jenis Bahan</th>
                <th className="py-3.5 px-5">Sumber & Lokasi</th>
                <th className="py-3.5 px-5">Spesifikasi Teknis</th>
                <th className="py-3.5 px-5">Stok</th>
                <th className="py-3.5 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {materials.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/70">
                  <td className="py-4 px-5 font-mono font-bold text-indigo-700">
                    {m.kodeLot}
                  </td>
                  <td className="py-4 px-5 font-semibold text-slate-900">
                    {m.jenis}
                  </td>
                  <td className="py-4 px-5 text-slate-700">
                    <div className="font-medium">{m.sumber}</div>
                    <div className="text-xs text-slate-400">{m.lokasiAsal}</div>
                  </td>
                  <td className="py-4 px-5 text-xs text-slate-600 max-w-xs">
                    {m.spesifikasi}
                  </td>
                  <td className="py-4 px-5 font-semibold text-slate-800">
                    {m.volumeStok}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      {m.statusVerifikasi}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Material Lot */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900">
                Registrasi Lot Bahan Baku (Pemasok)
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Jenis Bahan
                </label>
                <select
                  value={jenis}
                  onChange={(e) => {
                    const val = e.target.value as MaterialLot['jenis'];
                    setJenis(val);
                    if (val.includes('FABA')) {
                      setKodeLot('F-005');
                      setSumber('PLTU Tanjung Jati');
                    } else if (val.includes('Sekam')) {
                      setKodeLot('S-003');
                      setSumber('Desa Suka Maju');
                    } else {
                      setKodeLot('N-003');
                      setSumber('PT Kimia Nusantara');
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="FABA (Fly Ash & Bottom Ash)">
                    FABA (Fly Ash & Bottom Ash)
                  </option>
                  <option value="Sekam Padi (Silika Aktif)">
                    Sekam Padi (Silika Aktif)
                  </option>
                  <option value="NaOH (Alkali Aktivator)">
                    NaOH (Alkali Aktivator)
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Nomor / Kode Lot
                  </label>
                  <input
                    type="text"
                    value={kodeLot}
                    onChange={(e) => setKodeLot(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Volume Stok Masuk
                  </label>
                  <input
                    type="text"
                    value={volumeStok}
                    onChange={(e) => setVolumeStok(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Sumber Asal Bahan (PLTU / Desa / Pabrik)
                </label>
                <input
                  type="text"
                  value={sumber}
                  onChange={(e) => setSumber(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Lokasi Distribusi / Gudang
                </label>
                <input
                  type="text"
                  value={lokasiAsal}
                  onChange={(e) => setLokasiAsal(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Spesifikasi Karakterisasi
                </label>
                <input
                  type="text"
                  value={spesifikasi}
                  onChange={(e) => setSpesifikasi(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Penanggung Jawab Pemasok
                </label>
                <input
                  type="text"
                  value={pemasok}
                  onChange={(e) => setPemasok(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                >
                  Simpan Lot Bahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
