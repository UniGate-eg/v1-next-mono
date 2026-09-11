"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { HelpCircle, ChevronDown, ArrowLeft, ArrowRight, BookOpen, Compass, ShieldCheck } from "lucide-react";

interface FAQItem {
  questionEn: string;
  questionAr: string;
  answerEn: string;
  answerAr: string;
  category: "admissions" | "platform" | "universities";
}

const faqs: FAQItem[] = [
  {
    category: "universities",
    questionEn: "What is the difference between Public, Private, and National universities in Egypt?",
    questionAr: "ما الفرق بين الجامعات الحكومية والخاصة والأهلية في مصر؟",
    answerEn:
      "Public universities are state-funded institutions with centralized Tansik admission. Private universities are independent institutions licensed by the Ministry of Higher Education. National (Ahleya) universities are non-profit public-interest institutions established by presidential decrees offering modern interdisciplinary curricula at subsidized tuition rates.",
    answerAr:
      "الجامعات الحكومية تابعة للدولة ويتم القبول بها عبر التنسيق الإلكتروني الموحد. الجامعات الخاصة مؤسسات مستقلة معتمدة من وزارة التعليم العالي. الجامعات الأهلية مؤسسات غير هادفة للربح أُنشئت بقرارات جمهورية وتقدم برامج بينية حديثة ومصروفات مدعومة مقارنة بالخاصة.",
  },
  {
    category: "admissions",
    questionEn: "How does the UniGate comparison tool work?",
    questionAr: "كيف تعمل أداة المقارنة في بوابة الجامعة؟",
    answerEn:
      "You can select up to 4 universities or specific faculty programs and compare tuition fees, accreditations, teaching models (e.g., German, American, British), location, and required minimum admission scores side-by-side.",
    answerAr:
      "يمكنك اختيار ما يصل إلى 4 جامعات أو برامج كليات محددة للمقارنة بين المصروفات والاعتمادات ونماذج التعليم (أمريكي، ألماني، بريطاني) والموقع الجغرافي والحد الأدنى للقبول جنباً إلى جنب.",
  },
  {
    category: "platform",
    questionEn: "Are tuition fees and degree programs on UniGate verified?",
    questionAr: "هل المصروفات والبرامج الدراسية المعروضة موثقة؟",
    answerEn:
      "Yes. Our editorial and admissions research team aggregates data directly from official university gazettes, council announcements, and verified institution publications for the 2026 academic year.",
    answerAr:
      "نعم. يراجع فريق البحث الأكاديمي البيانات المنشورة استناداً إلى الإعلانات الرسمية للجامعات والقرارات الوزارية المعتمدة للعام الدراسي ٢٠٢٦.",
  },
  {
    category: "admissions",
    questionEn: "Can international or certificate equivalent students (IGCSE, SAT, Thanaweya Amma) use UniGate?",
    questionAr: "هل تدعم المنصة طلاب الشهادات المعادلة (IGCSE، SAT، البكالوريا)؟",
    answerEn:
      "UniGate provides comprehensive guide tracks for General Secondary (Thanaweya Amma), Arab and Foreign equivalents (IGCSE, American Diploma, IB, STEM) across all recognized institutions.",
    answerAr:
      "توفر بوابة الجامعة مسارات إرشادية لطلاب الثانوية العامة والشهادات المعادلة العربية والأجنبية (IGCSE، والدبلومة الأمريكية، والبكالوريا الدولية، ومدارس المتفوقين STEM) لجميع الجامعات المعتمدة.",
  },
];

export default function FAQPage() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
            {isAr ? "الأسئلة الشائعة وإرشادات الطلاب" : "Frequently Asked Questions & Student Guide"}
          </h1>
          <p className="page-subtitle animate-in">
            {isAr
              ? "إجابات واضحة وموثوقة عن التقديم، وأنواع الجامعات، وتكاليف الدراسة في مصر."
              : "Clear, verified answers regarding Egyptian university admissions, models, and tuition."}
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: "80px", maxWidth: "860px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                style={{
                  background: "var(--bg-surface, rgba(17, 24, 39, 0.7))",
                  border: "1px solid var(--border, rgba(255, 255, 255, 0.08))",
                  borderRadius: "14px",
                  overflow: "hidden",
                  transition: "border-color 0.2s, background-color 0.2s",
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(index)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "20px 24px",
                    background: "none",
                    border: "none",
                    textAlign: isAr ? "right" : "left",
                    color: "inherit",
                    cursor: "pointer",
                    gap: "16px",
                  }}
                  aria-expanded={isOpen}
                >
                  <span
                    style={{
                      fontSize: "15.5px",
                      fontWeight: 600,
                      color: isOpen ? "var(--primary-light, #38bdf8)" : "var(--text-primary, #f8fafc)",
                      lineHeight: 1.5,
                    }}
                  >
                    {isAr ? faq.questionAr : faq.questionEn}
                  </span>
                  <ChevronDown
                    size={18}
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                      flexShrink: 0,
                      color: "var(--text-muted, #94a3b8)",
                    }}
                  />
                </button>
                {isOpen && (
                  <div
                    style={{
                      padding: "0 24px 22px",
                      fontSize: "14px",
                      lineHeight: 1.7,
                      color: "var(--text-secondary, #cbd5e1)",
                      borderTop: "1px solid rgba(255, 255, 255, 0.04)",
                      paddingTop: "16px",
                    }}
                  >
                    {isAr ? faq.answerAr : faq.answerEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="about-disclaimer" style={{ marginTop: "40px" }}>
          <div className="disclaimer-icon">💬</div>
          <div>
            <h4>{isAr ? "لم تجد إجابة لسؤالك؟" : "Have more questions?"}</h4>
            <p>
              {isAr
                ? "فريق بوابة الجامعة يسعد دائماً بمساعدتك. يمكنك مراسلتنا أو مراجعة صفحة التعريف بالمنصة لمعرفة المزيد."
                : "Our team is here to help. Reach out to our community counselors or review our platform overview on the About page."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
