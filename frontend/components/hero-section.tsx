"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { HeroHeader } from "./navbar/header";
import ContentSection1 from "./sections/content-1";
import ContentSection5 from "./sections/content-5";
import SectionOne from "./sections/section-1";



export default function HeroSection() {
  const MapKarawang = dynamic(() => import("@/components/map/map-karawang"), {
    ssr: false, // hanya render di client
    loading: () => <p className="text-center text-sm text-muted-foreground">Loading map...</p>,
  });
  return (
    <>
      <HeroHeader />
      <main className="overflow-hidden">
        <div aria-hidden className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block">
          <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
          <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
          <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
        </div>
        <section>
          <div className="relative pt-24 md:pt-36">
            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      delayChildren: 1,
                    },
                  },
                },
                item: {
                  hidden: {
                    opacity: 0,
                    y: 20,
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      type: "spring",
                      bounce: 0.3,
                      duration: 2,
                    },
                  },
                },
              }}
              className="mask-b-from-35% mask-b-to-90% absolute inset-0 top-56 -z-20 lg:top-32"
            >
              <Image src="https://ik.imagekit.io/lrigu76hy/tailark/night-background.jpg?updatedAt=1745733451120" alt="background" className="hidden size-full dark:block" width="3276" height="4095" />
            </AnimatedGroup>

            <div aria-hidden className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]" />

            
            <SectionOne />
            <MapKarawang />

            <ContentSection1 />
            <ContentSection5 />
          </div>
        </section>
      </main>
    </>
  );
}
