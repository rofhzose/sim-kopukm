// src/components/navbar/menu-items.ts

export interface MenuItem {
  name: string;
  href?: string;
  subItems?: { name: string; href: string }[];
}

export const menuItems: MenuItem[] = [
  { name: "Beranda", href: "/" },
<<<<<<< HEAD
  
  {
    name: "UMKM", href: "/umkm"
  },
=======

>>>>>>> 216502ed80c33cbf41a37dfbd9894657796e4d6f
  {
    name: "Informasi",
    subItems: [
      { name: "Profile Dinas", href: "/informasi/profile-dinas" },
      { name: "Data Awal UMKM", href: "/informasi/data-awal/umkm" },
            { name: "Data Awal Koperasi", href: "/informasi/data-awal/koperasi" },
      { name: "Bantuan Hukum", href: "/informasi/bantuan-hukum" },
      { name: "Aktifitas", href: "/informasi/-aktifitas" },
      { name: "Prestasi", href: "/informasi/-prestasi" },
    ],
  },
  {
    name: "Pelayanan",
    subItems: [
      { name: "Bantuan", href: "/pelayanan/bantuan" },
      { name: "Konsultasi", href: "/pelayanan/konsultasi" },
      { name: "Pengaduan", href: "/pelayanan/pengaduan" },
      { name: "Survei Kepuasan", href: "/pelayanan/survei-kepuasan" },
      { name: "Perizinan", href: "/pelayanan/perizinan" },
    ],
  },
  {
    name: "Agenda",
    subItems: [
        { name: "Event Mendatang", href: "Agenda/event-mendatang" },
        { name: "Event Arsip", href: "Agenda/event-arsip" },
      { name: "Perjalanan Dinas", href: "/agenda/perjalanan-dinas" },
      
    ],
  },
];