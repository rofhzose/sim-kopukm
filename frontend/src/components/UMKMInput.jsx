import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  useLoadScript,
  StandaloneSearchBox,
} from "@react-google-maps/api";

const libraries = ["places"];

const defaultCenter = { lat: -6.322, lng: 107.302 }; // Fallback: Karawang / sesuaikan

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
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState(null);

  const mapRef = useRef();
  const searchBoxRef = useRef();

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // === UPDATE KOORDINAT & MARKER ===
  const updateLocation = (lat, lng, address = "") => {
    setForm((prev) => ({
      ...prev,
      latitude: lat.toFixed(8),
      longitude: lng.toFixed(8),
      alamat: address || prev.alamat,
    }));
    setMarkerPosition({ lat, lng });
    setMapCenter({ lat, lng });
  };

  // === KLIK PETA ===
  const onMapClick = useCallback((e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    reverseGeocode(lat, lng);
  }, []);

  // === DRAG MARKER ===
  const onMarkerDragEnd = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    reverseGeocode(lat, lng);
  };

  // === REVERSE GEOCODING (koordinat → alamat) ===
  const reverseGeocode = async (lat, lng) => {
    if (!window.google?.maps) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        const address = results[0].formatted_address;
        let kecamatan = "";
        let desa = "";

        results[0].address_components.forEach((component) => {
          if (component.types.includes("administrative_area_level_3")) kecamatan = component.long_name;
          if (component.types.includes("administrative_area_level_4") || component.types.includes("locality")) desa = component.long_name;
        });

        setForm((prev) => ({
          ...prev,
          alamat: address,
          kecamatan: kecamatan || prev.kecamatan,
          desa: desa || prev.desa,
        }));
      }
      updateLocation(lat, lng, results[0]?.formatted_address || "");
    });
  };

  // === SEARCH BOX ===
  const onPlacesChanged = () => {
    const places = searchBoxRef.current.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const address = place.formatted_address;

      let kec = "", des = "";
      place.address_components.forEach((comp) => {
        if (comp.types.includes("administrative_area_level_3")) kec = comp.long_name;
        if (comp.types.includes("administrative_area_level_4") || comp.types.includes("locality")) des = comp.long_name;
      });

      setForm((prev) => ({
        ...prev,
        alamat: address,
        kecamatan: kec || prev.kecamatan,
        desa: des || prev.desa,
      }));

      updateLocation(lat, lng, address);
    }
  };

  // === TOMBOL LOKASI SAYA ===
  const goToMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Browser tidak mendukung geolocation");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        reverseGeocode(lat, lng);
      },
      (error) => {
        alert("Gagal mengambil lokasi: " + error.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // === PERTAMA BUKA MAP → LANGSUNG KE GPS (jika bisa) ===
  useEffect(() => {
    if (showMap && isLoaded && !markerPosition) {
      goToMyLocation();
    }
  }, [showMap, isLoaded]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.latitude || !form.longitude) {
      alert("Silakan pilih lokasi di peta terlebih dahulu!");
      return;
    }
    onSubmit(form);
    onClose();
  };

  return (
    <div className="bg-gradient-to-br from-white/95 via-blue-50/90 to-purple-50/95 backdrop-blur-xl shadow-2xl border border-white/50 rounded-2xl p-8 mt-6">

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
          className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-lg"
        >
          Tutup
        </button>
      </div>

      {/* FORM GRID */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

        {/* Nama Lengkap */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Nama Lengkap</label>
          <input name="nama" value={form.nama} onChange={handleChange} required
            className="px-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Nama pemilik" />
        </div>

        {/* Jenis Kelamin */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Jenis Kelamin</label>
          <select name="jenis_kelamin" value={form.jenis_kelamin} onChange={handleChange} required
            className="px-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">Pilih</option>
            <option value="LAKI-LAKI">Laki-laki</option>
            <option value="PEREMPUAN">Perempuan</option>
          </select>
        </div>

        {/* Nama Usaha */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Nama Usaha</label>
          <input name="nama_usaha" value={form.nama_usaha} onChange={handleChange} required
            className="px-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Contoh: Warung Makan Bu Siti" />
        </div>

        {/* Alamat (bisa diedit manual) */}
        <div className="flex flex-col md:col-span-2 lg:col-span-3">
          <label className="text-sm font-semibold text-gray-700 mb-2">Alamat Lengkap</label>
          <input name="alamat" value={form.alamat} onChange={handleChange} required
            className="px-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Alamat akan otomatis terisi dari peta" />
        </div>

        {/* Kecamatan & Desa */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Kecamatan</label>
          <input name="kecamatan" value={form.kecamatan} onChange={handleChange} required
            className="px-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Desa/Kelurahan</label>
          <input name="desa" value={form.desa} onChange={handleChange} required
            className="px-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        {/* Koordinat (readonly) */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Latitude</label>
          <input value={form.latitude || ""} readOnly placeholder="Otomatis dari peta"
            className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl cursor-not-allowed" />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Longitude</label>
          <input value={form.longitude || ""} readOnly placeholder="Otomatis dari peta"
            className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl cursor-not-allowed" />
        </div>

        {/* Jenis UKM & NIB */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Jenis UKM</label>
          <input name="jenis_ukm" value={form.jenis_ukm} onChange={handleChange} required
            className="px-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Contoh: Kuliner, Fashion, dll" />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">NIB (Nomor Induk Berusaha)</label>
          <input name="nib" value={form.nib} onChange={handleChange} required
            className="px-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="123456789012345" />
        </div>

        {/* TOMBOL BUKA PETA */}
        <button
          type="button"
          onClick={() => setShowMap(true)}
          className="col-span-full py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-xl flex items-center justify-center gap-3"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {form.latitude ? "Ubah Lokasi di Peta" : "Pilih Lokasi di Google Maps (Wajib)"}
        </button>

        {/* TOMBOL SIMPAN */}
        <button
          type="submit"
          className="col-span-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-2xl flex items-center justify-center gap-3"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Simpan Data UMKM
        </button>
      </form>

      {/* MODAL PETA */}
      {showMap && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] relative overflow-hidden">

            {/* Header Peta */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 z-20 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Pilih Lokasi Usaha</h3>
                <button onClick={() => setShowMap(false)} className="bg-white/20 hover:bg-white/30 px-5 py-2 rounded-lg font-medium">
                  Tutup
                </button>
              </div>

              {/* Search Box */}
              {isLoaded && (
                <StandaloneSearchBox onLoad={(ref) => (searchBoxRef.current = ref)} onPlacesChanged={onPlacesChanged}>
                  <input
                    type="text"
                    placeholder="Cari alamat, pasar, sekolah, dll..."
                    className="w-1/4 px-5 py-3 rounded-xl text-gray-800 bg-white outline-none text-base"
                  />
                </StandaloneSearchBox>
              )}

              {/* Tombol Lokasi Saya */}
              <button
                onClick={goToMyLocation}
                className="absolute top-28 right-6 bg-white text-blue-600 px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 font-bold hover:bg-blue-50 transition"
              >
                Lokasi Saya Sekarang
              </button>
            </div>

            {/* Google Maps */}
            <div className="h-full pt-48">
              {!isLoaded ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-lg font-medium text-gray-700">Memuat Google Maps...</p>
                </div>
              ) : (
                <GoogleMap
                  onLoad={(map) => (mapRef.current = map)}
                  zoom={17}
                  center={mapCenter}
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  onClick={onMapClick}
                  options={{ streetViewControl: false }}
                >
                  {markerPosition && (
                    <Marker position={markerPosition} draggable={true} onDragEnd={onMarkerDragEnd} />
                  )}
                </GoogleMap>
              )}
            </div>

            {/* Info Koordinat */}
            {markerPosition && (
              <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur p-4 rounded-xl shadow-2xl text-sm font-medium">
                <p className="text-green-600 font-bold">Lokasi Terpilih</p>
                <p>Lat: {form.latitude}</p>
                <p>Lng: {form.longitude}</p>
                <p className="text-xs text-gray-600 mt-2">{form.alamat}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}