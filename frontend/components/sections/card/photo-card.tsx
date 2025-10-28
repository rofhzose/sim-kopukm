"use client";

import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, ReactNode } from "react";

// === Interfaces ===
interface BadgeProps {
  title?: string;
  subtitle?: string;
}

interface PhotoCardProps {
  imageSrc?: string;
  imageAlt?: string;
  badge?: BadgeProps | null;
  className?: string;
  children?: ReactNode;
  index?: number;
  onSwipe?: (dir: number) => void;
  active?: boolean;
}

// === Sample Data ===
const photos = [
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

// === Main Component ===
export default function PhotoCardStack() {
  const [cards, setCards] = useState(photos);
  const [swiping, setSwiping] = useState(false);

  const handleSwipe = async (dir: number) => {
    if (swiping) return; // biar gak double swipe
    setSwiping(true);

    // tunggu animasi keluar dulu
    await new Promise((resolve) => setTimeout(resolve, 400));

    setCards((prev) => {
      const updated = [...prev];
      const top = updated.shift();
      if (top) updated.push(top);
      return updated;
    });

    setSwiping(false);
  };

  return (
    <div className="relative w-[350px] h-[500px] mx-auto mt-10 select-none">
      <AnimatePresence>
        {cards
          .slice(0, 3)
          .reverse()
          .map((photo, i) => (
            <SwipeablePhotoCard
              key={photo.imageSrc || `card-${i}`}
              {...photo}
              index={i}
              onSwipe={handleSwipe}
              active={i === 0} // hanya top card yang aktif
            />
          ))}
      </AnimatePresence>
    </div>
  );
}

// === Swipeable Card ===
function SwipeablePhotoCard({
  imageSrc,
  imageAlt = "photo",
  badge = null,
  className = "",
  index = 0,
  onSwipe,
  active = false,
  children,
}: PhotoCardProps) {
  const fallbackImage = "/next.svg";
  const validSrc = imageSrc && imageSrc.trim() !== "" ? imageSrc : fallbackImage;

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-300, 0, 300], [0, 1, 0]);

  return (
    <motion.div
      className={`absolute w-full h-full rounded-2xl shadow-2xl overflow-hidden bg-white ${
        active ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"
      } ${className}`}
      style={{
        x,
        rotate,
        opacity,
        zIndex: 10 - index,
        scale: 1 - index * 0.05,
        y: index * 10,
      }}
      drag={active ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      onDragEnd={(_, info) => {
        if (!active) return;
        if (info.offset.x > 120 && onSwipe) onSwipe(1);
        else if (info.offset.x < -120 && onSwipe) onSwipe(-1);
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 - index * 0.05, y: index * 10 }}
      exit={{
        x: x.get() > 0 ? 500 : -500,
        opacity: 0,
        transition: { duration: 0.4 },
      }}
    >
      {/* === Main Image === */}
      <div className="relative w-full h-full">
        <Image
          src={validSrc}
          alt={imageAlt}
          fill
          className="object-cover"
          priority
        />

        {/* === Badge === */}
        {badge && (
          <div className="absolute bottom-0 right-0 w-56 md:w-64 lg:w-72">
            <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-3 m-3">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-12 h-12 rounded-md overflow-hidden">
                  <Image
                    src={validSrc}
                    alt="thumb"
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  {badge.title && (
                    <h4 className="text-sm font-semibold">{badge.title}</h4>
                  )}
                  {badge.subtitle && (
                    <p className="text-xs text-slate-500">{badge.subtitle}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {children && <div className="mt-8">{children}</div>}
    </motion.div>
  );
}
