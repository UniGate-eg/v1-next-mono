import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const GOVERNORATE_MAP: Record<string, { en: string; ar: string }> = {
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

export function formatGovernorate(gov: string, lang: "en" | "ar" = "en"): string {
  const normalized = gov.toLowerCase().replace(/[\s-]+/g, "_");
  const entry = GOVERNORATE_MAP[normalized];
  return (entry ? entry[lang] : null) || gov;
}

const CITY_MAP: Record<string, { en: string; ar: string }> = {
  "new cairo": { en: "New Cairo", ar: "القاهرة الجديدة" },
  "6th of october city": { en: "6th of October City", ar: "مدينة 6 أكتوبر" },
  "sheikh zayed": { en: "Sheikh Zayed", ar: "الشيخ زايد" },
  "new administrative capital": { en: "New Administrative Capital", ar: "العاصمة الإدارية الجديدة" },
  "knowledge city, nac": { en: "Knowledge City, NAC", ar: "مدينة المعرفة، العاصمة الإدارية" },
  "badr city": { en: "Badr City", ar: "مدينة بدر" },
  "new beni suef": { en: "New Beni Suef", ar: "بني سويف الجديدة" },
  "new borg el arab": { en: "New Borg El Arab", ar: "برج العرب الجديدة" },
  "el sherouk city": { en: "El Sherouk City", ar: "مدينة الشروق" },
  "new damietta": { en: "New Damietta", ar: "دمياط الجديدة" },
  "cairo-ismailia road": { en: "Cairo-Ismailia Road", ar: "طريق القاهرة الإسماعيلية" },
  "new assiut": { en: "New Assiut", ar: "أسيوط الجديدة" },
  "new minya": { en: "New Minya", ar: "المنيا الجديدة" },
  "mostorod / gesr el suez": { en: "Mostorod / Gesr El Suez", ar: "مسطرد / جسر السويس" },
  "el horreya": { en: "El Horreya", ar: "الحرية" },
  "new sohag": { en: "New Sohag", ar: "سوهاج الجديدة" },
  "obour city": { en: "Obour City", ar: "مدينة العبور" },
  "galala city": { en: "Galala City", ar: "مدينة الجلالة" },
  "smouha": { en: "Smouha", ar: "سموحة" },
  "new mansoura": { en: "New Mansoura", ar: "المنصورة الجديدة" },
  "east port said": { en: "East Port Said", ar: "شرق بورسعيد" },
  "10th of ramadan city": { en: "10th of Ramadan City", ar: "مدينة العاشر من رمضان" },
  "new alamein city": { en: "New Alamein City", ar: "مدينة العلمين الجديدة" },
  "qena": { en: "Qena", ar: "قنا" },
  "new ismailia": { en: "New Ismailia", ar: "الإسماعيلية الجديدة" },
  "kafr el sheikh": { en: "Kafr El Sheikh", ar: "كفر الشيخ" },
  "tanta": { en: "Tanta", ar: "طنطا" },
  "suez": { en: "Suez", ar: "السويس" },
  "ain helwan": { en: "Ain Helwan", ar: "عين حلوان" },
};

export function formatCity(city: string, lang: "en" | "ar" = "en"): string {
  const normalized = city.trim().toLowerCase();
  const entry = CITY_MAP[normalized];
  return (entry ? entry[lang] : null) || city;
}

const UNIVERSITY_TYPE_MAP: Record<string, { en: string; ar: string }> = {
  PUBLIC: { en: "Public", ar: "حكومية" },
  PRIVATE: { en: "Private", ar: "خاصة" },
  NATIONAL: { en: "National", ar: "أهلية" },
  INTERNATIONAL: { en: "International", ar: "دولية" },
};

export function formatUniversityType(type: string, lang: "en" | "ar" = "en"): string {
  const entry = UNIVERSITY_TYPE_MAP[String(type || "").toUpperCase()];
  return (entry ? entry[lang] : null) || type;
}
