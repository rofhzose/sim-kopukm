import React, { useState, useCallback } from "react";
import {
  GoogleMap,
  Marker,
  useLoadScript,
} from "@react-google-maps/api";

export default function UMKMInput({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    nama: "",
    jenis_kelamin: "",
    nama_usaha: "",
    alamat: "",
    kecamatan: "",
    desa: "",
    longitude: "",
    latitude: "",
    jenis_ukm: "",
    nib: "",
  });

  const [showMap, setShowMap] = useState(false);

  // === LOAD GOOGLE MAPS ===
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  // === SAAT CLICK MAP ===
  const handleMapClick = useCallback((e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    setForm((prev) => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString(),
    }));
  }, []);

  const center = {
    lat: -6.322,
    lng: 107.302,
  };

  return (
    <div className="bg-gradient-to-br from-white/95 via-blue-50/90 to-purple-50/95 backdrop-blur-xl shadow-2xl border border-white/50 rounded-2xl p-8 mt-6 animate-fadeIn">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200/50">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Tambah Data UMKM
          </h2>
          <p className="text-sm text-gray-600 mt-1">Lengkapi informasi usaha mikro kecil menengah</p>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
        >
          Tutup
        </button>
      </div>

      {/* === POPUP GOOGLE MAPS === */}
      {showMap && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-[90%] h-[80%] relative overflow-hidden border border-gray-200">

            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 p-4 z-50 flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">Pilih Lokasi di Peta</h3>
              <button
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-all duration-300 font-medium"
                onClick={() => setShowMap(false)}
              >
                Tutup
              </button>
            </div>

            {!isLoaded ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-700">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-lg font-medium">Loading Maps...</p>
              </div>
            ) : (
              <div className="h-full pt-16">
                <GoogleMap
                  zoom={14}
                  center={center}
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  onClick={handleMapClick}
                >
                  {/* Marker jika user klik */}
                  {form.latitude && form.longitude && (
                    <Marker
                      position={{
                        lat: parseFloat(form.latitude),
                        lng: parseFloat(form.longitude),
                      }}
                    />
                  )}
                </GoogleMap>
              </div>
            )}

          </div>
        </div>
      )}

      {/* FORM */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Nama Lengkap</label>
          <input 
            name="nama" 
            onChange={handleChange} 
            placeholder="Masukkan nama lengkap" 
            className="px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md outline-none"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Jenis Kelamin</label>
          <select 
            name="jenis_kelamin" 
            onChange={handleChange} 
            className="px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md outline-none"
            required
          >
            <option value="">Pilih jenis kelamin</option>
            <option value="LAKI-LAKI">Laki-laki</option>
            <option value="PEREMPUAN">Perempuan</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Nama Usaha</label>
          <input 
            name="nama_usaha" 
            onChange={handleChange} 
            placeholder="Masukkan nama usaha" 
            className="px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md outline-none"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Alamat</label>
          <input 
            name="alamat" 
            onChange={handleChange} 
            placeholder="Masukkan alamat lengkap" 
            className="px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md outline-none"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Kecamatan</label>
          <input 
            name="kecamatan" 
            onChange={handleChange} 
            placeholder="Masukkan kecamatan" 
            className="px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md outline-none"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Desa</label>
          <input 
            name="desa" 
            onChange={handleChange} 
            placeholder="Masukkan desa" 
            className="px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md outline-none"
            required
          />
        </div>

        {/* TAMPILKAN KOORDINAT */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Longitude</label>
          <input
            name="longitude"
            value={form.longitude}
            readOnly
            placeholder="Pilih dari Maps"
            className="px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200 rounded-xl cursor-not-allowed shadow-sm"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Latitude</label>
          <input
            name="latitude"
            value={form.latitude}
            readOnly
            placeholder="Pilih dari Maps"
            className="px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200 rounded-xl cursor-not-allowed shadow-sm"
          />
        </div>

        {/* MAP BUTTON */}
        <button
          type="button"
          onClick={() => setShowMap(true)}
          className="col-span-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Pilih Lokasi di Google Maps
        </button>

        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Jenis UKM</label>
          <input 
            name="jenis_ukm" 
            onChange={handleChange} 
            placeholder="Masukkan jenis UKM" 
            className="px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md outline-none"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">NIB</label>
          <input 
            name="nib" 
            onChange={handleChange} 
            placeholder="Masukkan NIB" 
            className="px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md outline-none"
            required
          />
        </div>

        {/* BTN SIMPAN */}
        <button
          onClick={handleSubmit}
          className="col-span-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] flex items-center justify-center gap-2 mt-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Simpan Data UMKM
        </button>
      </div>

    </div>
  );
}