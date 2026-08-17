# Data Model Specification: Production Data Architecture & Admin CMS Suite

**Feature Branch**: `002-data-cms`  
**Date**: 2026-08-17  
**Status**: Completed  

---

## 1. Relational Entities (Prisma 6 Schema)

```prisma
// ==========================================
// 1. Core Academic Institutions
// ==========================================

model University {
  id                  String              @id @default(cuid())
  slug                String              @unique
  shortName           String?
  emoji               String?             @default("🏛️")
  nameEn              String
  nameAr              String
  educationModel      EducationModel      @default(EGYPTIAN)
  type                UniversityType      @default(PUBLIC)
  governorate         String
  city                String?
  addressEn           String?
  addressAr           String?
  overviewEn          String?             @db.Text
  overviewAr          String?             @db.Text
  website             String?
  logoUrl             String?
  established         Int?
  qsRanking           String?
  theRanking          String?
  phones              String[]            @default([])
  emails              String[]            @default([])
  socialLinks         Json?               // { facebook, linkedin, instagram, twitter, youtube }
  strengthsEn         String[]            @default([])
  strengthsAr         String[]            @default([])
  publishStatus       PublishStatus       @default(PUBLISHED)

  // Relationships
  accreditations      Accreditation[]
  faculties           Faculty[]
  degreePrograms      DegreeProgram[]
  bookmarks           Bookmark[]
  suggestions         Suggestion[]
  auditLogs           AuditLog[]

  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt

  @@index([educationModel])
  @@index([type])
  @@index([governorate])
  @@index([publishStatus])
  @@map("universities")
}

// ==========================================
// 2. Academic Divisions / Faculties
// ==========================================

model Faculty {
  id                  String              @id @default(cuid())
  universityId        String
  nameEn              String
  nameAr              String
  descriptionEn       String?             @db.Text
  descriptionAr       String?             @db.Text
  deanName            String?
  departments         String[]            @default([])

  // Relationships
  university          University          @relation(fields: [universityId], references: [id], onDelete: Cascade)
  degreePrograms      DegreeProgram[]

  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt

  @@index([universityId])
  @@map("faculties")
}

// ==========================================
// 3. Degree Programs & Academic Majors
// ==========================================

model DegreeProgram {
  id                  String              @id @default(cuid())
  slug                String
  universityId        String
  facultyId           String?
  nameEn              String
  nameAr              String
  degreeType          String              // e.g., "Bachelor's Degree", "Master's Degree", "Pharm.D."
  durationYears       Int                 @default(4)
  studyLanguage       String              @default("English")
  tuitionEgpPerYear   Int?                // Numeric integer (e.g. 85000)
  tuitionUsdPerYear   Int?                // Numeric integer (e.g. 4500)
  careerOpportunities String[]            @default([])
  dualDegreePartner   String?             // e.g., "Technische Universität Berlin (Germany)"

  // Relationships
  university          University          @relation(fields: [universityId], references: [id], onDelete: Cascade)
  faculty             Faculty?            @relation(fields: [facultyId], references: [id], onDelete: SetNull)

  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt

  @@unique([slug, universityId])
  @@index([universityId])
  @@index([facultyId])
  @@index([tuitionEgpPerYear])
  @@map("degree_programs")
}

// ==========================================
// 4. Institutional Accreditations
// ==========================================

model Accreditation {
  id                  String              @id @default(cuid())
  universityId        String
  name                String              // e.g., "ABET", "RIBA", "NAQAAE"
  fullName            String?
  
  // Relationships
  university          University          @relation(fields: [universityId], references: [id], onDelete: Cascade)

  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt

  @@index([universityId])
  @@map("accreditations")
}

// ==========================================
// 5. Operational Governance & Audit Trail
// ==========================================

model AuditLog {
  id                  String              @id @default(cuid())
  universityId        String?
  actorId             String
  actorEmail          String?
  action              String              // "CREATE_UNIVERSITY", "UPDATE_TUITION", "APPROVE_SUGGESTION"
  entityType          String              // "University", "Faculty", "DegreeProgram", "Suggestion"
  entityId            String
  beforeState         Json?
  afterState          Json?
  ipAddress           String?

  // Relationships
  university          University?         @relation(fields: [universityId], references: [id], onDelete: SetNull)

  createdAt           DateTime            @default(now())

  @@index([actorId])
  @@index([universityId])
  @@index([entityType, entityId])
  @@map("audit_logs")
}

// ==========================================
// 6. Enums
// ==========================================

enum EducationModel {
  AMERICAN
  GERMAN
  BRITISH
  EGYPTIAN
  FRENCH
  CANADIAN
}

enum UniversityType {
  PUBLIC
  PRIVATE
  NATIONAL
  INTERNATIONAL
}

enum PublishStatus {
  PUBLISHED
  DRAFT
  ARCHIVED
}

enum UserRole {
  STUDENT
  EDITOR
  ADMIN
  SUPER_ADMIN
}
```

---

## 2. Zod Validation Contracts (Domain Layer)

### University Schema Validation
```typescript
import { z } from "zod";

export const CreateUniversitySchema = z.object({
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  shortName: z.string().min(1).max(20).optional(),
  emoji: z.string().min(1).max(10).default("🏛️"),
  nameEn: z.string().min(3).max(150),
  nameAr: z.string().min(3).max(150),
  educationModel: z.enum(["AMERICAN", "GERMAN", "BRITISH", "EGYPTIAN", "FRENCH", "CANADIAN"]),
  type: z.enum(["PUBLIC", "PRIVATE", "NATIONAL", "INTERNATIONAL"]),
  governorate: z.string().min(2).max(50),
  city: z.string().max(100).optional(),
  addressEn: z.string().optional(),
  addressAr: z.string().optional(),
  overviewEn: z.string().optional(),
  overviewAr: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  logoUrl: z.string().optional(),
  established: z.number().int().min(900).max(2100).optional(),
  qsRanking: z.string().optional(),
  theRanking: z.string().optional(),
  phones: z.array(z.string()).default([]),
  emails: z.array(z.string().email()).default([]),
  socialLinks: z.record(z.string()).optional(),
  strengthsEn: z.array(z.string()).default([]),
  strengthsAr: z.array(z.string()).default([]),
  publishStatus: z.enum(["PUBLISHED", "DRAFT", "ARCHIVED"]).default("PUBLISHED"),
});

export const UpdateUniversitySchema = CreateUniversitySchema.partial().extend({
  id: z.string().min(1),
});
```

### Degree Program Schema Validation
```typescript
export const CreateDegreeProgramSchema = z.object({
  universityId: z.string().min(1),
  facultyId: z.string().optional(),
  slug: z.string().min(2).max(60),
  nameEn: z.string().min(3).max(150),
  nameAr: z.string().min(3).max(150),
  degreeType: z.string().min(2).max(50),
  durationYears: z.number().int().min(1).max(8).default(4),
  studyLanguage: z.string().default("English"),
  tuitionEgpPerYear: z.number().int().nonnegative().optional(),
  tuitionUsdPerYear: z.number().int().nonnegative().optional(),
  careerOpportunities: z.array(z.string()).default([]),
  dualDegreePartner: z.string().optional(),
});
```

---

## 3. Entity State Transitions

### Suggestion Lifecycle
```
[User Submits] -> PENDING
                   ├── [Admin Approves] -> MERGED (Target Record Updated, Cache Purged, Audit Log Created)
                   └── [Admin Rejects]  -> REJECTED (Reason Captured in Notes)
```

### University Publishing Lifecycle
```
[Admin Drafts] -> DRAFT (Visible only to ADMIN / EDITOR)
                   ├── [Admin Publishes] -> PUBLISHED (Indexed in Search Index, Public in Catalog)
                   └── [Admin Archives]  -> ARCHIVED (Hidden from public catalog, retained for historical links)
```
