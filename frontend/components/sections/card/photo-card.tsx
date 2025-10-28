"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from "framer-motion";
import Image from "next/image";

// === Interfaces ===
interface BadgeProps {
  title?: string;
  subtitle?: string;
}

interface Photo {
  imageSrc: string;
  badge?: BadgeProps;
}

interface PhotoCardProps {
  photo: Photo;
  index: number;
  isFront: boolean;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
}

// === Sample Data ===
const photos: Photo[] = [
  {
    imageSrc: "/umkm/umkm.jpeg",
    badge: { title: "Mountain View", subtitle: "Switzerland" },
  },
  {
    imageSrc: "/umkm/umkm1.jpg",
    badge: { title: "Ocean Escape", subtitle: "Bali, Indonesia" },
  },
  {
    imageSrc: "/umkm/umkm2.jpg",
    badge: { title: "Desert Glow", subtitle: "Sahara" },
  },
  {
    imageSrc: "/umkm/umkm3.jpg",
    badge: { title: "Forest Trail", subtitle: "Japan" },
  },
];

// === Card Component ===
const SwipeCard: React.FC<PhotoCardProps> = ({ photo, isFront, setIndex }) => {
  const [exitX, setExitX] = useState(0);

  const x = useMotionValue(0);
  const scale = useTransform(x, [-150, 0, 150], [0, 1, 0]);
  const rotate = useTransform(x, [-150, 0, 150], [-90, 0, 90]);

  const variantsFront = {
    animate: { scale: 1, y: 0, opacity: 1 },
    exit: (custom: number) => ({
      x: custom,
      opacity: 0,
      scale: 0.85,
      rotate: custom > 0 ? 15 : -15,
      transition: { duration: 0.35, ease: "easeInOut" },
    }),
  };

  const variantsBack = {
    initial: { scale: 0.0, y: 30, opacity: 0.6 },
    animate: { scale: 0.95, y: 30, opacity: 0.8 },
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -100) {
      setExitX(-300);
      setIndex((prev) => prev + 1);
    } else if (info.offset.x > 100) {
      setExitX(300);
      setIndex((prev) => prev + 1);
    }
  };

  return (
    <motion.div
      className="absolute w-full h-full"
      style={{ x, rotate, scale }}
      drag={isFront ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      variants={isFront ? variantsFront : variantsBack}
      initial="initial"
      animate="animate"
      exit="exit"
      custom={exitX}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* === Image Card === */}
      <motion.div
        className="relative w-full h-full rounded-2xl overflow-hidden"
        style={{
          boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
          border: "2px solid rgba(255,255,255,0.2)",
          backdropFilter: "blur(6px)",
        }}
      >
        <Image src={photo.imageSrc} alt="photo" fill className="object-cover" style={{ objectFit: "cover", pointerEvents: "none" }} priority />

        {/* === Subtle Stroke / Glow Effect === */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            border: "2px solid rgba(255,255,255,0.5)",
            boxShadow: "inset 0 0 10px rgba(255,255,255,0.3), 0 0 20px rgba(0,0,0,0.2)",
          }}
        />

        {/* === Badge === */}
        {photo.badge && (
          <div className="absolute bottom-0 right-0 w-56 md:w-64 lg:w-72">
            <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-3 m-3">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-12 h-12 rounded-md overflow-hidden">
                  <Image src={photo.imageSrc} alt="thumb" width={48} height={48} className="object-cover w-full h-full" />
                </div>
                <div>
                  {photo.badge.title && <h4 className="text-sm font-semibold">{photo.badge.title}</h4>}
                  {photo.badge.subtitle && <p className="text-xs text-slate-500">{photo.badge.subtitle}</p>}
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// === Main Component ===
export default function PhotoCardStack() {
  const [index, setIndex] = useState(0);
  const total = photos.length;

  const current = photos[index % total];
  const next = photos[(index + 1) % total];

  return (
    <div className="relative w-[900px] h-[500px] mx-auto select-none">
      <AnimatePresence initial={false}>
        {/* Back Card */}
        <SwipeCard key={(index + 1) % total} photo={next} index={index + 1} isFront={false} setIndex={setIndex} />
        {/* Front Card */}
        <SwipeCard key={index % total} photo={current} index={index} isFront={true} setIndex={setIndex} />
      </AnimatePresence>
    </div>
  );
}
