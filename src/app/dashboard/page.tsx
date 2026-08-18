"use client";

import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUniversitySearch } from "@/hooks/useUniversitySearch";
import { useBookmarks } from "@/hooks/useBookmarks";
import { NoteDialog } from "@/components/dashboard/NoteDialog";
import { UniversityModal, type UniversityData } from "@/components/university/UniversityModal";
import Link from "next/link";
import type { AppStatus } from "@/schemas/bookmark.schema";

const statusToColMap: Record<string, string> = {
  INTERESTED: "shortlisted",
  RESEARCHING: "shortlisted",
  APPLIED: "applied",
  ACCEPTED: "accepted",
  REJECTED: "shortlisted",
};

const colToStatusMap: Record<string, AppStatus> = {
  shortlisted: "INTERESTED",
  applied: "APPLIED",
  accepted: "ACCEPTED",
};

export default function DashboardPage() {
  const { language } = useLanguage();
  const { index: universitiesDatabase } = useUniversitySearch();
  const { bookmarks, updateBookmark, deleteBookmark, isLoading } = useBookmarks();
  const [selectedUniModal, setSelectedUniModal] = useState<UniversityData | null>(null);

  const getLangField = (obj: any, fieldName: string) => {
    if (!obj) return "";
    if (language === "ar" && obj[fieldName + "_ar"]) return obj[fieldName + "_ar"];
    return obj[fieldName] || "";
  };

  const columns: Record<
    string,
    { title: string; titleAr: string; items: any[] }
  > = {
    shortlisted: {
      title: "⭐ Shortlisted",
      titleAr: "⭐ قائمة الاهتمام",
      items: [],
    },
    applied: {
      title: "📝 Applied",
      titleAr: "📝 تم التقديم",
      items: [],
    },
    accepted: {
      title: "🎉 Accepted",
      titleAr: "🎉 تم القبول",
      items: [],
    },
  };

  bookmarks.forEach((b) => {
    const uniIdStr = String(b.universityId || b.university?.id);
    const dbUni = universitiesDatabase.find((u: any) => String(u.id) === uniIdStr) || {
      id: uniIdStr,
      name: b.university?.nameEn || "University",
      name_ar: b.university?.nameAr || "جامعة",
      shortName: b.university?.nameEn || "Uni",
      emoji: "🏛️",
      city: b.university?.governorate || "Egypt",
      tuition: "Inquire Admissions",
    };

    const targetCol = statusToColMap[b.status] || "shortlisted";
    if (columns[targetCol]) {
      columns[targetCol].items.push({
        bookmark: b,
        uni: dbUni,
      });
    }
  });

  const handleStageChange = (bookmarkId: string, newCol: string) => {
    const newStatus = colToStatusMap[newCol] || "INTERESTED";
    updateBookmark({
      bookmarkId,
      status: newStatus,
    });
  };

  return (
    <div className="dashboard-page-container">
      {/* Mini Page Hero */}
      <div className="page-hero-mini">
        <div className="gradient-orb orb-mini-1"></div>
        <div className="gradient-orb orb-mini-2"></div>
        <div className="container">
          <h1 className="page-title animate-in">
            {language === "ar" ? "لوحة متابعة التقديم" : "Application Dashboard"}
          </h1>
          <p className="page-subtitle animate-in">
            {language === "ar"
              ? "تابع جامعاتك المحفوظة ونظم مراحل تقديمك من الاهتمام حتى القبول."
              : "Track your saved universities and organize your application journey."}
          </p>
        </div>
      </div>

      <div className="container section">
        <div className="section-header">
          <span className="section-badge">📊 {language === "ar" ? "مساحة العمل" : "Workspace"}</span>
          <h2>{language === "ar" ? "مراحل القبول الجامعي" : "Admissions Pipeline"}</h2>
          <p>
            {language === "ar"
              ? "نقل بطاقات الجامعات وتدوين الملاحظات الشخصية لكل تقديم."
              : "Move university cards across stages and save private notes."}
          </p>
        </div>

        {bookmarks.length === 0 && !isLoading ? (
          <div
            className="empty-state animate-in"
            style={{
              padding: "60px 20px",
              textAlign: "center",
              background: "var(--bg-glass)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎓</div>
            <h3>
              {language === "ar"
                ? "لوحة التقديم الخاصة بك فارغة حالياً"
                : "Your Application Board is Empty"}
            </h3>
            <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
              {language === "ar"
                ? "احفظ الجامعات من دليل الجامعات لتنظيم مواعيدك وملاحظاتك هنا."
                : "Bookmark universities from the directory to track your admissions here."}
            </p>
            <div style={{ marginTop: "20px" }}>
              <Link href="/universities" className="view-details-btn">
                {language === "ar" ? "استكشف الجامعات" : "Explore Universities"} →
              </Link>
            </div>
          </div>
        ) : (
          <div className="kanban-board" id="kanbanBoard">
            {Object.keys(columns).map((statusKey) => {
              const col = columns[statusKey];
              return (
                <div key={statusKey} className="kanban-column" data-status={statusKey}>
                  <div className="kanban-header">
                    <h3>{language === "ar" ? col.titleAr : col.title}</h3>
                    <span className="kanban-count" id={`count-${statusKey}`}>
                      {col.items.length}
                    </span>
                  </div>

                  <div className="kanban-cards-container">
                    {col.items.length === 0 ? (
                      <div className="kanban-empty">
                        {language === "ar" ? "لا توجد جامعات في هذه المرحلة" : "No universities in this stage"}
                      </div>
                    ) : (
                      col.items.map(({ bookmark, uni }) => (
                        <div
                          key={bookmark.id}
                          className="kanban-card"
                          style={{
                            background: "var(--bg-card)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius-md)",
                            padding: "16px",
                            marginBottom: "12px",
                          }}
                        >
                          <div
                            className="kanban-card-header"
                            style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}
                          >
                            <div className="kanban-card-emoji" style={{ fontSize: "24px" }}>
                              {uni.emoji || "🏛️"}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div className="kanban-card-title" style={{ fontWeight: "700", fontSize: "14px" }}>
                                {getLangField(uni, "name") || uni.name}
                              </div>
                              <div className="kanban-card-city" style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                {getLangField(uni, "city") || uni.city}
                              </div>
                            </div>
                            <button
                              onClick={() => deleteBookmark(bookmark.id)}
                              style={{ color: "var(--text-muted)", cursor: "pointer", fontSize: "14px" }}
                              title="Delete"
                            >
                              ✕
                            </button>
                          </div>

                          {bookmark.notes && (
                            <div
                              style={{
                                background: "rgba(251, 191, 36, 0.1)",
                                border: "1px solid rgba(251, 191, 36, 0.2)",
                                borderRadius: "8px",
                                padding: "8px 10px",
                                fontSize: "11px",
                                color: "#FCD34D",
                                marginBottom: "10px",
                              }}
                            >
                              &ldquo;{bookmark.notes}&rdquo;
                            </div>
                          )}

                          <div
                            className="kanban-card-footer"
                            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}
                          >
                            <NoteDialog
                              bookmarkId={bookmark.id}
                              universityName={getLangField(uni, "name") || uni.name}
                              initialNotes={bookmark.notes}
                            />

                            <div style={{ display: "flex", gap: "4px" }}>
                              {statusKey !== "shortlisted" && (
                                <button
                                  onClick={() => handleStageChange(bookmark.id, "shortlisted")}
                                  style={{
                                    fontSize: "11px",
                                    padding: "3px 8px",
                                    borderRadius: "8px",
                                    background: "rgba(255,255,255,0.06)",
                                    border: "1px solid var(--border)",
                                    color: "var(--text-secondary)",
                                    cursor: "pointer",
                                  }}
                                >
                                  ⭐ Shortlist
                                </button>
                              )}
                              {statusKey !== "applied" && (
                                <button
                                  onClick={() => handleStageChange(bookmark.id, "applied")}
                                  style={{
                                    fontSize: "11px",
                                    padding: "3px 8px",
                                    borderRadius: "8px",
                                    background: "rgba(251, 191, 36, 0.15)",
                                    border: "1px solid rgba(251, 191, 36, 0.3)",
                                    color: "#FBBF24",
                                    cursor: "pointer",
                                  }}
                                >
                                  📝 Applied
                                </button>
                              )}
                              {statusKey !== "accepted" && (
                                <button
                                  onClick={() => handleStageChange(bookmark.id, "accepted")}
                                  style={{
                                    fontSize: "11px",
                                    padding: "3px 8px",
                                    borderRadius: "8px",
                                    background: "rgba(16, 185, 129, 0.15)",
                                    border: "1px solid rgba(16, 185, 129, 0.3)",
                                    color: "#10B981",
                                    cursor: "pointer",
                                  }}
                                >
                                  🎉 Accepted
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* University Modal */}
      {selectedUniModal && (
        <UniversityModal
          uni={selectedUniModal}
          onClose={() => setSelectedUniModal(null)}
        />
      )}
    </div>
  );
}
