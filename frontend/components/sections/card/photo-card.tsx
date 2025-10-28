import Image from "next/image";
import { ReactNode } from "react";

interface BadgeProps {
  title?: string;
  subtitle?: string;
}

interface PhotoCardProps {
  imageSrc: string;
  imageAlt?: string;
  badge?: BadgeProps | null;
  className?: string;
  children?: ReactNode;
}

export default function PhotoCard({ imageSrc, imageAlt = "photo", badge = null, className = "", children }: PhotoCardProps) {
  return (
    <div className={`relative w-full max-w-3xl ${className}`}>
      <div className="relative overflow-hidden rounded-2xl shadow-xl hover:scale-[1.01] transition-transform duration-300">
        {/* Optimized Next.js Image */}
        <Image src={imageSrc} alt={imageAlt} width={1200} height={900} className="w-full h-64 md:h-80 lg:h-1/2 object-cover block" priority />

        {/* Floating badge (bottom-right) */}
        <div className="absolute bottom-0 right-0 w-56 md:w-64 lg:w-72">
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg p-3">
            {badge ? (
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-12 h-12 rounded-md overflow-hidden">
                  <Image src={imageSrc} alt="thumb" width={48} height={48} className="object-cover w-full h-full" />
                </div>
                <div>
                  {badge.title && <h4 className="text-sm font-semibold">{badge.title}</h4>}
                  {badge.subtitle && <p className="text-xs text-slate-500">{badge.subtitle}</p>}
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-700">Details</div>
            )}
          </div>
        </div>

        {/* Floating small round CTA top-left
        <div className="absolute top-4 left-4">
          <button className="bg-white/90 rounded-full p-2 shadow-md border border-white/60">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 3a1 1 0 01.894.553L13.382 8H17a1 1 0 110 2h-3.382l-2.488 4.447A1 1 0 0110 15v-12z" />
            </svg>
          </button>
        </div> */}
      </div>

      {children && <div className="mt-8">{children}</div>}
    </div>
  );
}
