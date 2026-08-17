"use client";

import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUniversitySearch } from "@/hooks/useUniversitySearch";
import { useCompareStore } from "@/stores/compareStore";
import Link from "next/link";

export default function ComparePage() {
  const { language } = useLanguage();
  const { index: universitiesDatabase } = useUniversitySearch();
  const { selectedIds, toggle, clear } = useCompareStore();
  const [selectorSearch, setSelectorSearch] = useState("");

  const getLangField = (obj: any, fieldName: string) => {
    if (!obj) return "";
    if (language === "ar" && obj[fieldName + "_ar"]) return obj[fieldName + "_ar"];
    return obj[fieldName] || "";
  };

  const getLangArray = (obj: any, fieldName: string): string[] => {
    if (!obj) return [];
    if (language === "ar" && obj[fieldName + "_ar"]) return obj[fieldName + "_ar"];
    return obj[fieldName] || [];
  };

  const selectedUnis = selectedIds
    .map((id) => universitiesDatabase.find((u: any) => String(u.id) === String(id)))
    .filter(Boolean);

  const rows = [
    { label: language === "ar" ? "النموذج التعليمي" : "Education Model", key: "model" },
    { label: language === "ar" ? "التصنيف العالمي (QS)" : "QS World Rank", key: "qs_ranking" },
    { label: language === "ar" ? "الموقع" : "Location", key: "location" },
    { label: language === "ar" ? "النوع" : "Type", key: "type" },
    { label: language === "ar" ? "التأسيس" : "Founded", key: "founded" },
    { label: language === "ar" ? "المصروفات" : "Tuition", key: "tuition" },
    {
      label: language === "ar" ? "الاعتمادات الدولية" : "Accreditation",
      key: "international_accreditations",
      type: "tags",
    },
    { label: language === "ar" ? "نقاط القوة" : "Key Strengths", key: "strengths", type: "tags" },
    { label: language === "ar" ? "الكليات" : "Faculties", key: "faculties", type: "list" },
  ];

  return (
    <div className="compare-page-container">
      {/* Page Hero Mini */}
      <div className="page-hero-mini">
        <div className="gradient-orb orb-mini-1"></div>
        <div className="gradient-orb orb-mini-2"></div>
        <div className="container">
          <h1 className="page-title animate-in">
            {language === "ar" ? "مقارنة الجامعات" : "Compare Universities"}
          </h1>
          <p className="page-subtitle animate-in">
            {language === "ar"
              ? "اختر حتى 3 جامعات للمقارنة جنباً إلى جنب."
              : "Select up to 3 universities to compare side-by-side on what matters most."}
          </p>
        </div>
      </div>

      <div className="container">
        {/* Quick selector search */}
        <div style={{ marginBottom: "16px", maxWidth: "400px" }}>
          <input
            type="text"
            placeholder={
              language === "ar" ? "ابحث عن جامعة للمقارنة..." : "Search university to compare..."
            }
            value={selectorSearch}
            onChange={(e) => setSelectorSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 16px",
              borderRadius: "20px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid var(--border)",
              color: "#FFF",
              fontSize: "14px",
            }}
          />
        </div>

        {/* Compare Selector Chips */}
        <div className="compare-selector animate-in" id="compareSelector">
          {universitiesDatabase
            .filter((u: any) => {
              if (!selectorSearch.trim()) return true;
              const s = selectorSearch.toLowerCase();
              return (
                (u.name || "").toLowerCase().includes(s) ||
                (u.shortName || "").toLowerCase().includes(s) ||
                (u.name_ar || "").includes(s)
              );
            })
            .map((uni: any) => {
              const isSelected = selectedIds.some((id) => String(id) === String(uni.id));
              return (
                <button
                  key={uni.id}
                  className={`compare-uni-btn ${isSelected ? "selected" : ""}`}
                  onClick={() => toggle(String(uni.id))}
                >
                  <span className="check-indicator"></span>
                  <span>{uni.emoji || "🏛️"}</span>
                  <span>{uni.shortName || uni.name}</span>
                </button>
              );
            })}
        </div>

        {/* Comparison Matrix Table */}
        {selectedUnis.length >= 2 ? (
          <div className="compare-table-wrapper animate-in" id="compareTableWrapper" style={{ marginTop: "32px" }}>
            <table className="compare-table">
              <thead>
                <tr>
                  <th style={{ width: "200px" }}>{language === "ar" ? "المعيار" : "Criteria"}</th>
                  {selectedUnis.map((u: any) => (
                    <th key={u.id}>
                      <div className="compare-uni-header">
                        <span className="emoji">{u.emoji || "🏛️"}</span>
                        <span>{u.shortName || u.name}</span>
                        <button
                          onClick={() => toggle(String(u.id))}
                          style={{
                            marginLeft: "8px",
                            color: "var(--text-muted)",
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key}>
                    <td className="font-bold">{row.label}</td>
                    {selectedUnis.map((u: any) => {
                      if (row.type === "tags") {
                        const tags = getLangArray(u, row.key);
                        return (
                          <td key={u.id}>
                            <div className="compare-tags">
                              {tags.length > 0 ? (
                                tags.map((t: string, idx: number) => (
                                  <span key={idx} className="compare-tag">
                                    {t}
                                  </span>
                                ))
                              ) : (
                                <span style={{ color: "var(--text-muted)" }}>N/A</span>
                              )}
                            </div>
                          </td>
                        );
                      } else if (row.type === "list") {
                        const list = getLangArray(u, row.key).slice(0, 6);
                        return (
                          <td key={u.id}>
                            <div className="compare-list" style={{ fontSize: "13px", lineHeight: "1.6" }}>
                              {list.map((item: string, idx: number) => (
                                <div key={idx} style={{ marginBottom: "4px" }}>
                                  • {item}
                                </div>
                              ))}
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td key={u.id}>
                          <span>{getLangField(u, row.key) || "—"}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ textAlign: "center", marginTop: "24px" }}>
              <button
                onClick={clear}
                className="view-details-btn"
                style={{ background: "rgba(255,255,255,0.08)", color: "var(--text-secondary)" }}
              >
                {language === "ar" ? "مسح التحديد" : "Clear Selection"}
              </button>
            </div>
          </div>
        ) : (
          <div
            className="empty-state animate-in"
            style={{
              padding: "60px 20px",
              textAlign: "center",
              background: "var(--bg-glass)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border)",
              marginTop: "32px",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚖️</div>
            <h3>
              {language === "ar"
                ? "اختر جامعتين على الأقل للبدء بالمقارنة"
                : "Select at least 2 universities to compare"}
            </h3>
            <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
              {language === "ar"
                ? "انقر على أسماء الجامعات في القائمة أعلاه أو أضفها من دليل الجامعات."
                : "Click university names above or add them directly from the directory cards."}
            </p>
            <div style={{ marginTop: "20px" }}>
              <Link href="/universities" className="view-details-btn">
                {language === "ar" ? "تصفح دليل الجامعات" : "Browse Universities"} →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
