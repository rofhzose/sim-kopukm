"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { Menu, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "../toogle-dark-mode";
import { menuItems } from "./menu-items";

export const HeroHeader = () => {
  // === 📦 STATE ===
  // menuState = false → tidak ada dropdown terbuka / menu mobile tertutup
  // menuState = true → menu mobile terbuka
  // menuState = number → index dropdown yang terbuka di desktop
  const [menuState, setMenuState] = React.useState<number | boolean>(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const closeTimeout = React.useRef<NodeJS.Timeout | null>(null);

  // === 📜 Scroll Listener ===
  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // === 🔧 Handler Dropdown Hover ===
  const handleDropdownHover = (index: number) => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current); // batalkan timeout jika mouse masuk lagi
    setMenuState(index);
  };

  const handleDropdownLeave = () => {
    // Tambahkan delay 300ms supaya user sempat klik submenu
    closeTimeout.current = setTimeout(() => {
      setMenuState(false);
    }, 100);
  };

  return (
    <header>
      <nav data-state={menuState && "active"} className="fixed z-20 w-full px-2">
        <div className={cn("mx-auto mt-2 max-w-full px-4 sm:px-8 md:px-16 lg:px-32 transition-all duration-300", isScrolled && "bg-background/50 max-w-4xl rounded-4xl border backdrop-blur-lg lg:px-5")}>
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            {/* === 🏁 LOGO + HAMBURGER === */}
            <div className="flex w-full justify-between lg:w-auto">
              <Link href="/" aria-label="home" className="flex items-center space-x-2">
                <Logo />
              </Link>

              {/* 🍔 Toggle Menu (mobile) */}
              <button onClick={() => setMenuState(menuState === true ? false : true)} aria-label={menuState ? "Close Menu" : "Open Menu"} className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                {/* Icon Menu (☰) */}
                <Menu className={cn("m-auto size-6 transform transition-all duration-200", menuState === true ? "scale-0 opacity-0 rotate-90" : "scale-100 opacity-100 rotate-0")} />

                {/* Icon Close (✕) */}
                <X className={cn("absolute inset-0 m-auto size-6 transform transition-all duration-200", menuState === true ? "scale-100 opacity-100 rotate-0" : "scale-0 opacity-0 -rotate-90")} />
              </button>
            </div>

            {/* === 💻 MENU DESKTOP === */}
            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-4 sm:gap-6 md:gap-8 text-xs sm:text-sm md:text-base lg:text-lg">
                {menuItems.map((item, index) => (
                  <li key={index} className="relative" onMouseEnter={() => handleDropdownHover(index)} onMouseLeave={handleDropdownLeave}>
                    {item.subItems ? (
                      // 🔘 Button dropdown
                      <button onClick={() => setMenuState(menuState === index ? false : index)} className="flex items-center gap-1 text-muted-foreground hover:text-accent-foreground duration-150">
                        <span>{item.name}</span>

                        {/* === Chevron Animasi === */}
                        <div className="relative w-4 h-4">
                          {/* Chevron Down */}
                          <ChevronDown className={cn("absolute inset-0 size-4 transform transition-all duration-200", menuState === index ? "opacity-0 scale-0 rotate-180" : "opacity-100 scale-100 rotate-0")} />

                          {/* Chevron Up */}
                          <ChevronUp className={cn("absolute inset-0 size-4 transform transition-all duration-200", menuState === index ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-0 -rotate-180")} />
                        </div>
                      </button>
                    ) : (
                      // 🔗 Menu tanpa dropdown (Beranda)
                      <Link href={item.href || "#"} className="text-muted-foreground hover:text-accent-foreground block duration-150">
                        <span>{item.name}</span>
                      </Link>
                    )}

                    {/* === ⬇️ Dropdown muncul saat hover === */}
                    {item.subItems && menuState === index && (
                      <ul className="absolute left-0 top-full mt-2 w-48 rounded-lg bg-background shadow-lg border border-border transition-all duration-200">
                        {item.subItems.map((sub, subIndex) => (
                          <li key={subIndex}>
                            <Link href={sub.href} className="block px-4 py-2 text-sm text-muted-foreground hover:text-accent-foreground hover:bg-accent/10">
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* === ⚙️ TOGGLE MODE + BUTTON === */}
            <div
              className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 
              md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none"
            >
              {/* === 📱 Menu Mobile === */}
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link href={item.href || "#"} className="text-muted-foreground hover:text-accent-foreground block duration-150">
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* === 🧭 Tombol Mode + Aksi === */}
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                <ModeToggle />
                <Button asChild variant="outline" size="sm" className={cn(isScrolled && "lg:hidden")}>
                  <Link href="#">
                    <span>Login</span>
                  </Link>
                </Button>
                <Button asChild size="sm" className={cn(isScrolled && "lg:hidden")}>
                  <Link href="#">
                    <span>Sign Up</span>
                  </Link>
                </Button>
                <Button asChild size="sm" className={cn(isScrolled ? "lg:inline-flex" : "hidden")}>
                  <Link href="#">
                    <span>Get Started</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
