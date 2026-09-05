"use client";

import { useEffect, useState } from "react";
import Logo from "./Logo";
import { Navbar } from "./Navbar";

const Header = () => {
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-100 bg-background/60 h-[84px] flex items-center justify-between px-5 sm:px-8 lg:px-10 xl:px-16 backdrop-blur-sm border-b border-white/10 transition-all duration-300${
        scrolled
          ? "bg-[#18110b]/90 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
          : "bg-[#18110b]/60"
      }`}
    >
      <Logo />
      <Navbar />
    </header>
  );
};

export default Header;
