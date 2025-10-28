import { AnimatedGroup } from "../ui/animated-group";
import { TextEffect } from "../ui/text-effect";
import { Variants } from "framer-motion";
import PhotoCardStack from "./card/photo-card";
import { Button } from "../ui/button";
import Link from "next/link";

const transitionVariants: { item: Variants } = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring",
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

export default function SectionOne() {
  return (
    <div className="h-[500px] w-full md:h-[600px] lg:h-[760px]">
      <div className="max-w-full mb-10 px-6">
        {/* Main beranda */}
        {/* Main Beranda */}
        <AnimatedGroup
          variants={{
            container: {
              visible: {
                transition: {
                  staggerChildren: 0.05,
                  delayChildren: 0.5,
                },
              },
            },
            ...transitionVariants,
          }}
          className="flex px-8 sm:mx-auto mt-5 items-start justify-center gap-8"
        >
          {/* Kiri Beranda */}
          <div className="flex-1">
            <TextEffect preset="fade-in-blur" speedSegment={0.3} as="h1" className="max-w-3xl font-bold text-left text-2xl max-md:font-semibold md:text-3xl xl:text-5xl" style={{ wordSpacing: "0.20em", color: "#244563" }}>
              Bersama Membangun Ekonomi Kerakyatan yang Mandiri dan Berdaya Saing.
            </TextEffect>
            <TextEffect per="line" preset="fade-in-blur" speedSegment={0.3} delay={0.5} as="p" className=" mt-8 max-w-xl text-left text-xl" style={{ wordSpacing: "0.20em", color: "#244563" }}>
              Melalui portal ini, kami membuka akses seluas-luasnya bagi pelaku koperasi dan UMKM untuk memperoleh informasi, layanan, serta dukungan pembinaan. Bersama masyarakat dan berbagai pemangku kepentingan, kami berupaya menciptakan
              ekosistem usaha yang inklusif dan produktif demi kesejahteraan ekonomi Kabupaten Karawang.
            </TextEffect>
            <div className="flex gap-8 pt-10 items-center">
              <Link href={"/informasi/data-awal/koperasi"}>
              <Button  size={"lg"}>Lihat Data Koperasi</Button>
              </Link>
            <Link href={"/informasi/data-awal/umkm"}>
            <Button variant={"outline"} size={"lg"}>Lihat Data UMKM</Button>
            </Link>
            </div>
          </div>

          {/* Kanan Beranda */}
          <div className="flex-1">
            <PhotoCardStack />
          </div>
        </AnimatedGroup>
      </div>
    </div>
  );
}
