"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { Scale, BookOpen, AlertCircle, RefreshCw, ArrowLeft, ArrowRight } from "lucide-react";

export default function TermsPage() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  return (
    <div className="about-page-container">
      {/* Mini Hero */}
      <div className="page-hero-mini">
        <div className="gradient-orb orb-mini-1" />
        <div className="gradient-orb orb-mini-2" />
        <div className="container">
          <div style={{ marginBottom: "16px" }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                color: "var(--text-muted)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
            >
              {isAr ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
              <span>{isAr ? "العودة للرئيسية" : "Back to Home"}</span>
            </Link>
          </div>
          <h1 className="page-title animate-in">
            {isAr ? "شروط الاستخدام والخدمة" : "Terms of Service & Usage"}
          </h1>
          <p className="page-subtitle animate-in">
            {isAr
              ? "القواعد والإرشادات المنظمة لاستخدام بوابة الجامعة ومقارنة البرامج الأكاديمية."
              : "Guidelines, rights, and policies governing the use of the UniGate university platform."}
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: "80px" }}>
        <div className="about-grid">
          <div className="about-card animate-in">
            <div className="about-card-icon">
              <Scale size={26} color="var(--primary-light, #38bdf8)" />
            </div>
            <h3>{isAr ? "الاستخدام العادل للأغراض التعليمية" : "Fair Academic Use"}</h3>
            <p>
              {isAr
                ? "تتاح محتويات المنصة وأدوات المقارنة مجاناً لجميع الطلاب وأولياء الأمور والمرشدين الأكاديميين للمساعدة في اتخاذ القرارات الجامعية السليمة."
                : "Platform contents and comparison tools are freely accessible to students, parents, and academic counselors for non-commercial educational decision-making."}
            </p>
          </div>

          <div className="about-card animate-in">
            <div className="about-card-icon">
              <BookOpen size={26} color="var(--primary-light, #38bdf8)" />
            </div>
            <h3>{isAr ? "دقة وتحديث المعلومات" : "Data Accuracy & Validation"}</h3>
            <p>
              {isAr
                ? "نبذل أقصى جهد للتحقق من المصروفات والبرامج وشروط القبول من مصادرها الرسمية، وتبقى الشروط النهائية خاضعة لإعلانات الجامعات ووزارة التعليم العالي."
                : "We vigorously verify tuition fees, curricula, and admission criteria from official sources; however, final admissions rules remain under the authority of respective universities and the Ministry of Higher Education."}
            </p>
          </div>

          <div className="about-card animate-in">
            <div className="about-card-icon">
              <AlertCircle size={26} color="var(--primary-light, #38bdf8)" />
            </div>
            <h3>{isAr ? "الملكية الفكرية والعلامات" : "Intellectual Property"}</h3>
            <p>
              {isAr
                ? "جميع الشعارات وأسماء الجامعات المعروضة هي علامات تجارية لأصحابها الأصليين، وتستخدم هنا للأغراض التعريفية والتعليمية فقط."
                : "All university logos, heraldry, and institutional names remain the intellectual property of their respective entities and are utilized strictly for descriptive and identification purposes."}
            </p>
          </div>

          <div className="about-card animate-in">
            <div className="about-card-icon">
              <RefreshCw size={26} color="var(--primary-light, #38bdf8)" />
            </div>
            <h3>{isAr ? "تحديثات الشروط والمنصة" : "Updates to Terms"}</h3>
            <p>
              {isAr
                ? "قد نقوم بتحديث بنود الخدمة دورياً لمواكبة التغيرات التنظيمية والتقنية. استمرارك في استخدام المنصة يعكس موافقتك على البنود المحدثة."
                : "We may periodically revise these terms to align with platform enhancements and regulatory requirements. Continued engagement indicates acceptance of updated guidelines."}
            </p>
          </div>
        </div>

        <div className="about-disclaimer" style={{ marginTop: "40px" }}>
          <div className="disclaimer-icon">⚖️</div>
          <div>
            <h4>{isAr ? "إخلاء المسؤولية الرسمي" : "Official Disclaimer"}</h4>
            <p>
              {isAr
                ? "بوابة الجامعة منصة مستقلة ودليل استرشادي لا يمثل جهة حكومية أو جامعية بعينها. يرجى دائماً مراجعة مكاتب القبول والتسجيل الرسمية قبل سداد أي مصروفات."
                : "UniGate is an independent advisory portal and directory. Always verify specific admission requirements, deadlines, and fee schedules directly with university admissions offices before finalizing commitments."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
