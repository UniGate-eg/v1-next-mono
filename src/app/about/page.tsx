"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AboutPage() {
  const { language } = useLanguage();

  return (
    <div className="about-page-container">
      {/* Page Mini Hero */}
      <div className="page-hero-mini">
        <div className="gradient-orb orb-mini-1"></div>
        <div className="gradient-orb orb-mini-2"></div>
        <div className="container">
          <h1 className="page-title animate-in">
            {language === "ar"
              ? "عن بوابة الجامعة (University Gate)"
              : "About University Gate"}
          </h1>
          <p className="page-subtitle animate-in">
            {language === "ar"
              ? "دليلك الشامل لاختيار جامعتك في مصر."
              : "Your comprehensive guide for Egyptian students choosing a university."}
          </p>
        </div>
      </div>

      <div className="container">
        <div className="about-grid">
          <div className="about-card about-mission animate-in">
            <div className="about-card-icon">🎯</div>
            <h3>{language === "ar" ? "رؤيتنا ورسالتنا" : "Our Mission"}</h3>
            <p>
              {language === "ar"
                ? "تم إنشاء منصة بوابة الجامعة لتوفير الوضوح والشفافية لأحد أهم القرارات في حياة الطالب: اختيار الجامعة المناسبة. نؤمن بأن كل طالب يستحق الوصول إلى معلومات موثوقة ومقارنة دون تعقيد."
                : "University Gate was built to bring clarity to one of the most important decisions in a student's life: choosing the right university. We believe every student deserves access to organized, trustworthy, and comparable information — free from marketing noise."}
            </p>
          </div>

          <div className="about-card animate-in">
            <div className="about-card-icon">🔍</div>
            <h3>{language === "ar" ? "ماذا نقدم" : "What We Do"}</h3>
            <p>
              {language === "ar"
                ? "نقوم بجمع وتنسيق كافة المعلومات الخاصة بالجامعات المصرية في ملفات موحدة سهلة القراءة والمقارنة. من المصروفات إلى نماذج التعليم ونقاط القوة — كل شيء بتنسيق موحد."
                : "We compile and structure information about Egyptian universities into standardized profiles that are easy to read, compare, and act on. From tuition to teaching models, strengths to student life — everything follows the same format."}
            </p>
          </div>

          <div className="about-card animate-in">
            <div className="about-card-icon">🤝</div>
            <h3>{language === "ar" ? "لمن هذه المنصة" : "Who It's For"}</h3>
            <p>
              {language === "ar"
                ? "طلاب الثانوية العامة والمعادلات لاختيار جامعتهم الأولى. الطلاب الراغبون في التحويل. أولياء الأمور الذين يبحثون عن معلومات موثوقة."
                : "High school students choosing their first university. Transfer students exploring options. Parents looking for reliable information. Anyone navigating Egypt's higher education landscape."}
            </p>
          </div>

          <div className="about-card animate-in">
            <div className="about-card-icon">⚡</div>
            <h3>{language === "ar" ? "قيمنا" : "Our Values"}</h3>
            <p>
              {language === "ar"
                ? "الحيادية والوضوح والصدق — نقدم المعلومات الدقيقة والموثوقة بدون تحيز لأي جامعة."
                : "Neutrality — we don't promote any university. Clarity — information should be easy to find and understand. Honesty — we present what institutions are genuinely known for."}
            </p>
          </div>
        </div>

        <div className="about-disclaimer animate-in" style={{ marginTop: "32px" }}>
          <div className="disclaimer-icon">⚠️</div>
          <h4>{language === "ar" ? "تنويه هام" : "Disclaimer"}</h4>
          <p>
            {language === "ar"
              ? "المعلومات مجمعة من مصادر عامة ورسمية. يرجى دائماً التأكد من التفاصيل عبر الموقع الرسمي للجامعة قبل التقديم. بوابة الجامعة هي منصة معلوماتية مستقلة."
              : "Information is compiled from public sources. Always verify details with the university's official website before applying. University Gate is an independent informational resource and is not affiliated with any university."}
          </p>
        </div>
      </div>
    </div>
  );
}
