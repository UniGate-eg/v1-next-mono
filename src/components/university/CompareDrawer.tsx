"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCompareStore } from "@/stores/compareStore";
import { useLanguage } from "@/contexts/LanguageContext";

export function CompareDrawer() {
  const { selectedUniversities, clear } = useCompareStore();
  const { language } = useLanguage();
  const router = useRouter();

  if (selectedUniversities.length === 0) return null;

  return (
    <div className="compare-drawer show" id="compareDrawer">
      <div className="compare-drawer-content">
        <div className="compare-drawer-left">
          <span className="compare-drawer-count" id="compareDrawerCount">
            {selectedUniversities.length} {language === "ar" ? "تم اختيار" : "selected"}
          </span>
          <div className="compare-drawer-icons" id="compareDrawerIcons">
            {selectedUniversities.map((u) => (
              <div
                key={u.id}
                className="compare-drawer-icon-bubble"
                title={language === "ar" ? u.nameAr : u.nameEn}
              >
                🏛️
              </div>
            ))}
          </div>
        </div>
        <div className="compare-drawer-actions">
          <Link
            href="/compare"
            className="compare-drawer-btn"
            id="compareDrawerBtn"
            onClick={(e) => {
              if (selectedUniversities.length < 2) {
                e.preventDefault();
                alert(
                  language === "ar"
                    ? "يرجى اختيار جامعتين على الأقل للمقارنة"
                    : "Please select at least 2 universities to compare."
                );
              }
            }}
          >
            {language === "ar" ? "قارن الآن 📊" : "Compare Now 📊"}
          </Link>
          <button className="compare-drawer-clear" id="compareDrawerClear" onClick={clear}>
            {language === "ar" ? "مسح" : "Clear"}
          </button>
        </div>
      </div>
    </div>
  );
}
