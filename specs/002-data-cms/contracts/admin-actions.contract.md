# Contract: Admin Server Actions & Mutation APIs

**Feature Branch**: `002-data-cms`  
**Date**: 2026-08-17  
**Status**: Approved  

---

## 1. Authentication & Role Authorization

All mutations in this contract require an active session where `session.user.role` is either `ADMIN` or `SUPER_ADMIN`. Non-authorized requests return `{ success: false, error: "UNAUTHORIZED", statusCode: 403 }`.

---

## 2. Server Action Specifications

### `adminUpsertUniversityAction(input: UpsertUniversityInput)`

Upserts an academic institution profile, logs the audit record, and executes on-demand cache revalidation.

- **Trigger**: Administrator submits the University Editor form at `/admin/universities/[id]`.
- **Input Contract**:
  ```typescript
  export interface UpsertUniversityInput {
    id?: string;
    slug: string;
    shortName?: string;
    emoji?: string;
    nameEn: string;
    nameAr: string;
    educationModel: "AMERICAN" | "GERMAN" | "BRITISH" | "EGYPTIAN" | "FRENCH" | "CANADIAN";
    type: "PUBLIC" | "PRIVATE" | "NATIONAL" | "INTERNATIONAL";
    governorate: string;
    city?: string;
    addressEn?: string;
    addressAr?: string;
    overviewEn?: string;
    overviewAr?: string;
    website?: string;
    established?: number;
    qsRanking?: string;
    theRanking?: string;
    phones: string[];
    emails: string[];
    socialLinks?: Record<string, string>;
    strengthsEn: string[];
    strengthsAr: string[];
    publishStatus: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  }
  ```
- **Response Contract**:
  ```typescript
  export type UpsertUniversityResponse = 
    | { success: true; data: { id: string; slug: string; updatedAt: string } }
    | { success: false; error: string; validationErrors?: Record<string, string[]> };
  ```
- **Side Effects**:
  1. Creates an `AuditLog` entry capturing `actorId`, `action: "UPSERT_UNIVERSITY"`, `beforeState`, `afterState`.
  2. Invokes `revalidateTag('universities')`.
  3. Invokes `revalidatePath('/universities')`.
  4. Invokes `revalidatePath('/universities/' + slug)`.

---

### `adminUpsertFacultyAction(input: UpsertFacultyInput)`

Adds or updates a faculty division with its dean and departmental list.

- **Input Contract**:
  ```typescript
  export interface UpsertFacultyInput {
    id?: string;
    universityId: string;
    nameEn: string;
    nameAr: string;
    descriptionEn?: string;
    descriptionAr?: string;
    deanName?: string;
    departments: string[];
  }
  ```
- **Response Contract**:
  ```typescript
  export type UpsertFacultyResponse = 
    | { success: true; data: { id: string; universityId: string } }
    | { success: false; error: string };
  ```

---

### `adminUpsertDegreeProgramAction(input: UpsertDegreeProgramInput)`

Creates or updates a degree program with numeric tuition fees and dual-degree affiliations.

- **Input Contract**:
  ```typescript
  export interface UpsertDegreeProgramInput {
    id?: string;
    universityId: string;
    facultyId?: string;
    slug: string;
    nameEn: string;
    nameAr: string;
    degreeType: string;
    durationYears: number;
    studyLanguage: string;
    tuitionEgpPerYear?: number;
    tuitionUsdPerYear?: number;
    careerOpportunities: string[];
    dualDegreePartner?: string;
  }
  ```
- **Response Contract**:
  ```typescript
  export type UpsertDegreeProgramResponse = 
    | { success: true; data: { id: string; slug: string } }
    | { success: false; error: string };
  ```

---

### `adminExportDatabaseSnapshotAction()`

Generates a complete, structured JSON representation of all universities, faculties, and programs.

- **Response Contract**:
  ```typescript
  export interface DatabaseSnapshotExport {
    exportedAt: string;
    schemaVersion: string;
    universitiesCount: number;
    universities: Array<any>;
  }
  ```
