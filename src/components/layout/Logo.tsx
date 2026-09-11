import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

const Logo = () => {
  const { language } = useLanguage();
  return (
    <>
      {/* Logo  */}
      <div className="flex items-center cursor-pointer shrink-0">
        <Link
          href="/"
          className="flex items-center justify-center hover:scale-105 transition-all duration-300"
        >
          <Image
            src={language === "ar" ? "/logo_ar.jpeg" : "/logo_en.jpeg"}
            alt={language === "ar" ? "بوابة الجامعة" : "University Gate"}
            width={80}
            height={80}
            priority
            className="object-contain sm:w-20 sm:h-20 w-16 h-16 sm:rounded-sm lg:rounded-md rounded-md"
          />
        </Link>
      </div>
    </>
  );
};

export default Logo;
