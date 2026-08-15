import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatGovernorate(gov: string): string {
  const map: Record<string, { en: string; ar: string }> = {
    cairo: { en: "Cairo", ar: "القاهرة" },
    giza: { en: "Giza", ar: "الجيزة" },
    alexandria: { en: "Alexandria", ar: "الإسكندرية" },
    qalyubia: { en: "Qalyubia", ar: "القليوبية" },
    dakahlia: { en: "Dakahlia", ar: "الدقهلية" },
    sharqia: { en: "Sharqia", ar: "الشرقية" },
    gharbia: { en: "Gharbia", ar: "الغربية" },
    monufia: { en: "Monufia", ar: "المنوفية" },
    beheira: { en: "Beheira", ar: "البحيرة" },
    ismailia: { en: "Ismailia", ar: "الإسماعيلية" },
    suez: { en: "Suez", ar: "السويس" },
    port_said: { en: "Port Said", ar: "بورسعيد" },
    damietta: { en: "Damietta", ar: "دمياط" },
    kafr_el_sheikh: { en: "Kafr El Sheikh", ar: "كفر الشيخ" },
    fayoum: { en: "Fayoum", ar: "الفيوم" },
    beni_suef: { en: "Beni Suef", ar: "بني سويف" },
    minya: { en: "Minya", ar: "المنيا" },
    assiut: { en: "Assiut", ar: "أسيوط" },
    sohag: { en: "Sohag", ar: "سوهاج" },
    qena: { en: "Qena", ar: "قنا" },
    luxor: { en: "Luxor", ar: "الأقصر" },
    aswan: { en: "Aswan", ar: "أسوان" },
    red_sea: { en: "Red Sea", ar: "البحر الأحمر" },
    new_valley: { en: "New Valley", ar: "الوادي الجديد" },
    matrouh: { en: "Matrouh", ar: "مطروح" },
    north_sinai: { en: "North Sinai", ar: "شمال سيناء" },
    south_sinai: { en: "South Sinai", ar: "جنوب سيناء" },
  };

  const normalized = gov.toLowerCase().replace(/[\s-]+/g, "_");
  return map[normalized]?.en || gov;
}
