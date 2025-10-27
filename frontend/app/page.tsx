import MapKarawang from "@/components/map/map-karawang";
import { HeroHeader } from "@/components/navbar/header";
import ContentSection1 from "@/components/sections/content-1";
import ContentSection5 from "@/components/sections/content-5";
import SectionOne from "@/components/sections/section-1";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative h-[500px] w-full md:h-[600px] lg:h-[900px]">
      <Image
        src="/bg-blue.png"
        alt="Hero Background"
        fill
        style={{
          objectFit: "cover",
          filter: "blur(2px)", // 👈 tambahkan blur di sini
        }}
        className="object-contain object-center opacity-90 blur-[2px]" // opsional, buat lebih lembut
      />

      <HeroHeader />
      <div className="relative pt-24 md:pt-36">
        <SectionOne />
        <MapKarawang />

        <ContentSection1 />
        <ContentSection5 />
      </div>
    </div>
  );
}
