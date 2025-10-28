"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export const Logo = () => {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // ✅ Delay setMounted asynchronously to avoid React 19 warning
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // 🌗 Determine theme safely
  const currentTheme = theme === "system" ? systemTheme : theme;
  const logoSrc =
    currentTheme === "dark" ? "/logo.png" : "/logo-dark.png";

  // 🕐 While waiting for hydration, show light logo as fallback
  if (!mounted) {
    return (
      <Image
        src="/logo.png"
        alt="Company Logo"
        width={170}
        height={20}
        priority
      />
    );
  }

  return (
    <Image
      src={logoSrc}
      alt="Company Logo"
      width={170}
      height={20}
      priority
    />
  );
};
