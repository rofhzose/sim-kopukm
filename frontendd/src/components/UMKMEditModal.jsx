// src/components/UMKMEditModal.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import axiosInstance from "../utils/axiosInstance";
import { Loader2, X, MapPin } from "lucide-react";
import Swal from "sweetalert2";
import {
  GoogleMap,
  Marker,
  useLoadScript,
  StandaloneSearchBox,
} from "@react-google-maps/api";

const libraries = ["places"];
const defaultCenter = { lat: -6.322, lng: 107.302 }; // Karawang

export default function UMKMEditModal({ isOpen, onClose, umkmId, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
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

  // Fetch data saat modal dibuka
  useEffect(() => {
    if (!isOpen || !umkmId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/umkm/${umkmId}`);
        if (res.data.success) {
          const data = res.data.data;
          setFormData(data);
          
          // Set marker jika sudah ada koordinat
          if (data.latitude && data.longitude) {
            const lat = parseFloat(data.latitude);
            const lng = parseFloat(data.longitude);
            setMarkerPosition({ lat, lng });
            setMapCenter({ lat, lng });
          }
        }
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: "Gagal memuat data UMKM",
          confirmButtonColor: "#d33",
        });
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, umkmId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // === UPDATE KOORDINAT & MARKER ===
  const updateLocation = (lat, lng, address = "") => {
    setFormData((prev) => ({
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
          if (component.types.includes("administrative_area_level_3"))
            kecamatan = component.long_name;
          if (
            component.types.includes("administrative_area_level_4") ||
            component.types.includes("locality")
          )
            desa = component.long_name;
        });

        setFormData((prev) => ({
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

      let kec = "",
        des = "";
      place.address_components.forEach((comp) => {
        if (comp.types.includes("administrative_area_level_3"))
          kec = comp.long_name;
        if (
          comp.types.includes("administrative_area_level_4") ||
          comp.types.includes("locality")
        )
          des = comp.long_name;
      });

      setFormData((prev) => ({
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
      Swal.fire({
        icon: "error",
        title: "Tidak Didukung",
        text: "Browser tidak mendukung geolocation",
        confirmButtonColor: "#d33",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        reverseGeocode(lat, lng);
      },
      (error) => {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: "Gagal mengambil lokasi: " + error.message,
          confirmButtonColor: "#d33",
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.latitude || !formData.longitude) {
      Swal.fire({
        icon: "warning",
        title: "Koordinat Kosong",
        text: "Silakan pilih lokasi di peta terlebih dahulu!",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await axiosInstance.put(`/umkm/${umkmId}`, formData);
      if (res.data.success) {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data UMKM berhasil diperbarui",
          confirmButtonColor: "#3085d6",
        });
        onSuccess();
        onClose();
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: err.response?.data?.message || "Gagal menyimpan perubahan",
        confirmButtonColor: "#d33",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600">
          <div>
            <h2 className="text-2xl font-bold text-white">Edit Data UMKM</h2>
            <p className="text-sm text-blue-100 mt-1">Perbarui informasi usaha mikro kecil menengah</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Memuat data...</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Nama */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  required
                  className="px-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Nama pemilik"
                />
              </div>

              {/* Jenis Kelamin */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">
                  Jenis Kelamin <span className="text-red-500">*</span>
                </label>
                <select
                  name="jenis_kelamin"
                  value={formData.jenis_kelamin}
                  onChange={handleChange}
                  required
                  className="px-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Pilih</option>
                  <option value="LAKI-LAKI">Laki-laki</option>
                  <option value="PEREMPUAN">Perempuan</option>
                </select>
              </div>

              {/* Nama Usaha */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">
                  Nama Usaha <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nama_usaha"
                  value={formData.nama_usaha}
                  onChange={handleChange}
                  required
                  className="px-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Contoh: Warung Makan Bu Siti"
                />
              </div>

              {/* Alamat */}
              <div className="flex flex-col md:col-span-2 lg:col-span-3">
                <label className="text-sm font-semibold text-gray-700 mb-2">
                  Alamat Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleChange}
                  required
                  className="px-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Alamat akan otomatis terisi dari peta"
                />
              </div>

              {/* Kecamatan */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">
                  Kecamatan <span className="text-red-500">*</span>
                </label>
                <input
                  name="kecamatan"
                  value={formData.kecamatan}
                  onChange={handleChange}
                  required
                  className="px-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Desa */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">
                  Desa/Kelurahan <span className="text-red-500">*</span>
                </label>
                <input
                  name="desa"
                  value={formData.desa}
                  onChange={handleChange}
                  required
                  className="px-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Latitude */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">Latitude</label>
                <input
                  value={formData.latitude || ""}
                  readOnly
                  placeholder="Otomatis dari peta"
                  className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl cursor-not-allowed font-mono text-sm"
                />
              </div>

              {/* Longitude */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">Longitude</label>
                <input
                  value={formData.longitude || ""}
                  readOnly
                  placeholder="Otomatis dari peta"
                  className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl cursor-not-allowed font-mono text-sm"
                />
              </div>

              {/* Jenis UKM */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">
                  Jenis UKM <span className="text-red-500">*</span>
                </label>
                <input
                  name="jenis_ukm"
                  value={formData.jenis_ukm}
                  onChange={handleChange}
                  required
                  className="px-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Contoh: Kuliner, Fashion, dll"
                />
              </div>

              {/* NIB */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">
                  NIB (Nomor Induk Berusaha)
                </label>
                <input
                  name="nib"
                  value={formData.nib}
                  onChange={handleChange}
                  className="px-4 py-3 bg-white/80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  placeholder="123456789012345"
                />
              </div>

              {/* TOMBOL BUKA PETA */}
              <button
                type="button"
                onClick={() => setShowMap(true)}
                className="col-span-full py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-xl flex items-center justify-center gap-3"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {formData.latitude ? "Ubah Lokasi di Peta" : "Pilih Lokasi di Google Maps"}
              </button>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-4 pt-6 mt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL PETA */}
      {showMap && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] relative overflow-hidden">
            {/* Header Peta */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 z-20 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Pilih Lokasi Usaha</h3>
                <button
                  onClick={() => setShowMap(false)}
                  className="bg-white/20 hover:bg-white/30 px-5 py-2 rounded-lg font-medium transition"
                >
                  Tutup
                </button>
              </div>

              {/* Search Box */}
              {isLoaded && (
                <StandaloneSearchBox
                  onLoad={(ref) => (searchBoxRef.current = ref)}
                  onPlacesChanged={onPlacesChanged}
                >
                  <input
                    type="text"
                    placeholder="Cari alamat, pasar, sekolah, dll..."
                    className="w-full md:w-1/2 px-5 py-3 rounded-xl text-gray-800 bg-white outline-none text-base"
                  />
                </StandaloneSearchBox>
              )}

              {/* Tombol Lokasi Saya */}
              <button
                onClick={goToMyLocation}
                className="absolute top-28 right-6 bg-white text-blue-600 px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 font-bold hover:bg-blue-50 transition"
              >
                <MapPin className="w-5 h-5" />
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
                    <Marker
                      position={markerPosition}
                      draggable={true}
                      onDragEnd={onMarkerDragEnd}
                    />
                  )}
                </GoogleMap>
              )}
            </div>

            {/* Info Koordinat */}
            {markerPosition && (
              <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur p-4 rounded-xl shadow-2xl text-sm font-medium max-w-md">
                <p className="text-green-600 font-bold mb-2">✓ Lokasi Terpilih</p>
                <p className="font-mono text-xs">Lat: {formData.latitude}</p>
                <p className="font-mono text-xs">Lng: {formData.longitude}</p>
                <p className="text-xs text-gray-600 mt-2 line-clamp-2">{formData.alamat}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}