# Contract: Slim Client Search Index & Query Interface

**Feature Branch**: `002-data-cms`  
**Date**: 2026-08-17  
**Status**: Approved  

---

## 1. Static Slim Search Index File Contract

- **URI**: `/search-index.json` (served as a static file from `public/search-index.json` with CDN caching).
- **Target Size**: Under 40 KB uncompressed (approx. 7–9 KB gzipped).
- **Schema**:
  ```typescript
  export interface SlimSearchToken {
    id: string;
    slug: string;
    shortName: string;
    nameEn: string;
    nameAr: string;
    emoji: string;
    city: string;
    model: string;
    type: string;
    tuitionMinEgp?: number;
    tuitionMaxEgp?: number;
    majors: string[]; // Array of unique major and faculty titles for text matching
  }

  export type SlimSearchIndex = SlimSearchToken[];
  ```

---

## 2. Dynamic University Detail Query Contract

- **Method**: Server Action `getUniversityDetailsBySlug(slug: string)` or Route Handler `/api/universities/[slug]`
- **Response**: Full relational university payload including faculties, deans, degree programs, accreditations, and contact numbers.
- **Cache Header**: `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`
- **Revalidation Tag**: `university-${slug}`, `universities`
