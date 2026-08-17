# Contract: Community Suggestion Moderation Pipeline

**Feature Branch**: `002-data-cms`  
**Date**: 2026-08-17  
**Status**: Approved  

---

## 1. Public Suggestion Submission Contract

- **Server Action**: `submitUniversitySuggestionAction(input: SubmitSuggestionInput)`
- **Input Contract**:
  ```typescript
  export interface SubmitSuggestionInput {
    universityId: string;
    type: "DATA_CORRECTION" | "MISSING_INFO" | "NEW_PROGRAM" | "TUITION_UPDATE";
    content: string;
    suggestedData?: Record<string, any>;
  }
  ```
- **Response**:
  ```typescript
  export type SubmitSuggestionResponse =
    | { success: true; suggestionId: string; message: string }
    | { success: false; error: string };
  ```

---

## 2. Admin Suggestion Moderation Contract

- **Server Action**: `adminResolveSuggestionAction(input: ResolveSuggestionInput)`
- **Role Requirement**: `ADMIN` or `SUPER_ADMIN`
- **Input Contract**:
  ```typescript
  export interface ResolveSuggestionInput {
    suggestionId: string;
    resolution: "APPROVE_AND_APPLY" | "REJECT";
    adminNotes?: string;
    overridePayload?: Record<string, any>;
  }
  ```
- **Behavior on `APPROVE_AND_APPLY`**:
  1. Merges verified data directly into the target `University` or `DegreeProgram` record.
  2. Updates `Suggestion` status to `RESOLVED`.
  3. Records an `AuditLog` entry.
  4. Triggers `revalidateTag('universities')`.
