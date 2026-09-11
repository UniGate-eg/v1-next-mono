"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { ShieldCheck, Lock, EyeOff, FileText, ArrowLeft, ArrowRight } from "lucide-react";

export default function PrivacyPage() {
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
            {isAr ? "سياسة الخصوصية وحماية البيانات" : "Privacy & Data Protection Policy"}
          </h1>
          <p className="page-subtitle animate-in">
            {isAr
              ? "نلتزم بحماية خصوصيتك وضمان سرية وأمان بياناتك الأكاديمية والشخصية."
              : "We are committed to protecting your privacy and ensuring your academic exploration remains secure."}
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: "80px" }}>
        <div className="about-grid">
          <div className="about-card animate-in">
            <div className="about-card-icon">
              <ShieldCheck size={26} color="var(--primary-light, #38bdf8)" />
            </div>
            <h3>{isAr ? "الشفافية في جمع البيانات" : "Transparent Data Collection"}</h3>
            <p>
              {isAr
                ? "نقوم بجمع الحد الأدنى من المعلومات التقنية اللازمة لتحسين تجربة تصفح ومقارنة الجامعات المصرية. لا نقوم ببيع أو تأجير أي بيانات لطرف ثالث."
                : "We collect only minimal technical information required to optimize university exploration and comparison. We never sell, lease, or monetize your personal data."}
            </p>
          </div>

          <div className="about-card animate-in">
            <div className="about-card-icon">
              <Lock size={26} color="var(--primary-light, #38bdf8)" />
            </div>
            <h3>{isAr ? "حماية وتشفير الحسابات" : "Security & Authentication"}</h3>
            <p>
              {isAr
                ? "يتم تشفير وتأمين جلسات المستخدمين باستخدام أحدث بروتوكولات الأمان والمعايير المعتمدة لحماية قوائم الرغبات والمقارنات المحفوظة."
                : "User sessions and authentication are secured using industry-standard protocols to safeguard saved university shortlists and comparison sets."}
            </p>
          </div>

          <div className="about-card animate-in">
            <div className="about-card-icon">
              <EyeOff size={26} color="var(--primary-light, #38bdf8)" />
            </div>
            <h3>{isAr ? "ملفات تعريف الارتباط والتفضيلات" : "Cookies & Local Storage"}</h3>
            <p>
              {isAr
                ? "نستخدم التخزين المحلي فقط لتذكر خياراتك المفضلة مثل لغة الواجهة (العربية / الإنجليزية) والجامعات المحددة للمقارنة."
                : "Local storage is utilized solely to remember your preferences—such as language selection (Arabic / English) and pinned universities for comparison."}
            </p>
          </div>

          <div className="about-card animate-in">
            <div className="about-card-icon">
              <FileText size={26} color="var(--primary-light, #38bdf8)" />
            </div>
            <h3>{isAr ? "الامتثال للقوانين والتشريعات" : "Regulatory Compliance"}</h3>
            <p>
              {isAr
                ? "تتوافق منصة بوابة الجامعة مع القانون المصري لحماية البيانات الشخصية رقم 151 لسنة 2020، مع الالتزام بالشفافية الكاملة."
                : "UniGate operates in full accordance with Egyptian Personal Data Protection Law No. 151/2020, guaranteeing institutional integrity and rights."}
            </p>
          </div>
        </div>

        <div className="about-disclaimer" style={{ marginTop: "40px" }}>
          <div className="disclaimer-icon">💡</div>
          <div>
            <h4>{isAr ? "استفسارات الخصوصية وحذف البيانات" : "Privacy Inquiries & Data Deletion"}</h4>
            <p>
              {isAr
                ? "يمكنك في أي وقت طلب مراجعة أو حذف بيانات حسابك أو إبداء أي ملاحظة بالتواصل المباشر مع فريق المنصة عبر البريد الرسمي."
                : "You may request verification, export, or deletion of your stored account preferences at any time by contacting our engineering and data team."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
