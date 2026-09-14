"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

const Logo = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";

  return (
    <div className="flex items-center cursor-pointer shrink-0">
      <Link
        href="/"
        className="flex items-center justify-center transition-all duration-300 group"
      >
        <Image
          src={
            isArabic
              ? "/Logo_Kit/arabic_writing_with university_logo.png"
              : "/Logo_Kit/English_version_with_writing.png"
          }
          alt={isArabic ? "دليل الجامعات" : "University Guide"}
          width={180}
          height={60}
          priority
          className="object-contain h-12 w-auto max-h-14 rounded-lg bg-white/95 p-1 shadow-sm transition-transform duration-300 group-hover:scale-105"
        />
      </Link>
    </div>
  );
};

export default Logo;
