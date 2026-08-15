# Interface Contract: Next.js Server Actions (RPC Layer)

**Feature**: UniCompass Core University Guide Platform (`001-unicompass-core-platform`)  
**Type**: Type-Safe Server Actions (Co-located RPC)  

---

## 1. Standard Response Envelope

All Server Actions return a discriminated union guaranteeing runtime error safety:

```typescript
export type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };
```

---

## 2. University Server Actions (`src/server/actions/university.actions.ts`)

### 2.1 `getUniversitiesAction(input: unknown)`
- **Caller**: University catalog page, search autocomplete, filter drawer.
- **Input Schema**:
  ```typescript
  export const UniversityFiltersSchema = z.object({
    type: z.enum(["PUBLIC", "PRIVATE", "NATIONAL", "INTERNATIONAL"]).optional(),
    governorate: z.string().optional(),
    search: z.string().max(100).optional(),
    page: z.number().int().positive().default(1),
    limit: z.number().int().min(1).max(100).default(20),
  });
  ```
- **Output (`data`)**:
  ```typescript
  {
    data: University[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }
  }
  ```

---

### 2.2 `getUniversityBySlugAction(slug: string)`
- **Caller**: University detail view (`/universities/[slug]`), comparison matrix renderer.
- **Input Schema**: `z.string().min(1).max(100)`
- **Output (`data`)**: `University & { majors: Major[] }`

---

## 3. Bookmark / Application Tracker Actions (`src/server/actions/bookmark.actions.ts`)

### 3.1 `createBookmarkAction(input: unknown)`
- **Auth Requirement**: Authenticated Session Required (`userId` inferred from session).
- **Input Schema**:
  ```typescript
  export const CreateBookmarkSchema = z.object({
    universityId: z.string().cuid(),
    status: z.enum(["INTERESTED", "RESEARCHING", "APPLIED", "ACCEPTED", "REJECTED"]).default("INTERESTED"),
    notes: z.string().max(500).optional(),
  });
  ```
- **Output (`data`)**: `Bookmark & { university: University }`

---

### 3.2 `updateBookmarkAction(input: unknown)`
- **Auth Requirement**: Authenticated Session Required (owner verification enforced).
- **Input Schema**:
  ```typescript
  export const UpdateBookmarkSchema = z.object({
    bookmarkId: z.string().cuid(),
    status: z.enum(["INTERESTED", "RESEARCHING", "APPLIED", "ACCEPTED", "REJECTED"]).optional(),
    notes: z.string().max(500).optional(),
  });
  ```
- **Output (`data`)**: `Bookmark`

---

### 3.3 `deleteBookmarkAction(bookmarkId: string)`
- **Auth Requirement**: Authenticated Session Required (owner verification enforced).
- **Input Schema**: `z.string().cuid()`
- **Output (`data`)**: `{ id: string; deleted: true }`

---

### 3.4 `getUserBookmarksAction()`
- **Auth Requirement**: Authenticated Session Required.
- **Input**: None (derives `userId` from active session).
- **Output (`data`)**: `(Bookmark & { university: University & { majors: Major[] } })[]`

---

## 4. Community Suggestion Actions (`src/server/actions/suggestion.actions.ts`)

### 4.1 `submitSuggestionAction(input: unknown)`
- **Auth Requirement**: Authenticated Session Required.
- **Input Schema**:
  ```typescript
  export const CreateSuggestionSchema = z.object({
    content: z.string().min(5).max(2000),
    type: z.enum(["DATA_CORRECTION", "MISSING_INFO", "NEW_UNIVERSITY", "GENERAL"]),
  });
  ```
- **Output (`data`)**: `Suggestion`
