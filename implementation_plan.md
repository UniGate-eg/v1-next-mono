# UniCompass — Production-Grade Technical Implementation Plan

> **Authored by:** Principal Full-Stack SWE  
> **Date:** August 2026  
> **Revision:** 1.0 — Approved for Execution

---

## Executive Summary

UniCompass is Egypt's first comprehensive university guide platform. The goal is to migrate from a fragile vanilla-JS + single-file PHP stack to a production-grade monolith capable of handling **100k+ concurrent users** at **$0/month infrastructure cost** during the launch phase, with a **linear scaling path** that requires no architectural rewrites.

The architecture is built on the **T3 philosophy** (typesafety, full-stack TypeScript, no runtime surprises) without tRPC — using **Next.js Server Actions** as the type-safe RPC layer to keep the mental model simple and the deployment surface minimal.

---

## 1. Finalized Tech Stack

| Layer | Technology | Stable Version | Rationale |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | `15.3.x` | SSG/ISR/SSR, RSC, Server Actions, Vercel-native |
| **Language** | TypeScript | `5.5.x` | End-to-end type safety |
| **Styling** | Tailwind CSS | `4.1.x` | Utility-first, JIT, zero-runtime |
| **UI Components** | shadcn/ui | `latest` | Accessible, headless, composable |
| **ORM** | Prisma | `6.x` | Type-safe queries, migration management |
| **DB Primary** | Neon Postgres | — | Serverless, free tier, branching |
| **DB Failover** | Prisma Accelerate | — | Lazy-init backup only |
| **DB Adapter** | `@prisma/adapter-pg` | `6.x` | Zero-overhead native Postgres driver |
| **Authentication** | BetterAuth | `1.x` | Modern, framework-native, Prisma adapter |
| **Validation** | Zod | `3.24.x` | Runtime + compile-time schema safety |
| **State Management** | Zustand | `5.x` | Minimal client-side global state |
| **Async Data (Client)** | TanStack Query | `5.x` | Cache, optimistic updates for dashboard |
| **Form Management** | React Hook Form + Zod | `7.x` | Zero-dependency form state + type-safe validation |
| **Env Validation** | `@t3-oss/env-nextjs` | `0.11.x` | Type-safe `.env` at build-time |
| **Linting** | ESLint + Prettier | `9.x / 3.x` | Uniform code style |
| **Testing** | Vitest + Playwright | `2.x / 1.x` | Unit/integration + E2E |
| **CI/CD** | GitHub Actions | — | Automated test, lint, and deploy pipeline |
| **Hosting** | Vercel | — | Zero-config Next.js deployment |

---

## 2. Project Initialization

### 2.1 Bootstrap the Project

```bash
# Initialize the T3-inspired stack (no tRPC, using Server Actions)
npx create-next-app@15 unicompass \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-npm

cd unicompass
```

### 2.2 Install All Dependencies

```bash
# Core ORM & Database
npm install prisma@6 @prisma/client@6 @prisma/adapter-pg@6 @prisma/extension-accelerate pg

# Authentication
npm install better-auth@1

# Validation
npm install zod@3.24

# Environment Safety
npm install @t3-oss/env-nextjs@0.11

# UI (shadcn bootstraps itself)
npx shadcn@latest init

# Client-side State & Data
npm install zustand@5 @tanstack/react-query@5 @tanstack/react-query-devtools@5

# Forms
npm install react-hook-form@7 @hookform/resolvers@3

# Developer Tools
npm install -D prettier prettier-plugin-tailwindcss @types/pg
```

### 2.3 Initialize Prisma

```bash
npx prisma init --datasource-provider postgresql
```

---

## 3. Project Architecture

The entire application follows a **strict layered architecture**. Each layer has a single responsibility and can only depend on layers below it (Dependency Inversion Principle).

```text
unicompass/
├── src/
│   ├── app/                          # Next.js App Router (Presentation Layer)
│   │   ├── (marketing)/              # Route Group: Public pages (SSG)
│   │   │   ├── page.tsx              # Homepage
│   │   │   └── about/page.tsx
│   │   ├── universities/
│   │   │   ├── page.tsx              # University listing (ISR, 1hr revalidation)
│   │   │   └── [slug]/page.tsx       # University detail page (ISR, generateStaticParams)
│   │   ├── majors/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── dashboard/                # Protected Route Group (BetterAuth middleware)
│   │   │   ├── layout.tsx            # Auth check, session hydration
│   │   │   ├── page.tsx              # Kanban board
│   │   │   └── settings/page.tsx
│   │   ├── api/
│   │   │   └── auth/[...all]/route.ts # BetterAuth catch-all handler
│   │   ├── layout.tsx                # Root layout (fonts, providers, analytics)
│   │   └── globals.css
│   │
│   ├── components/                   # Reusable UI (Atomic Design)
│   │   ├── ui/                       # shadcn primitives (Button, Card, Dialog...)
│   │   ├── layout/                   # Navbar, Footer, Sidebar
│   │   ├── university/               # UniversityCard, UniversitySearch, CompareDrawer
│   │   ├── dashboard/                # KanbanBoard, BookmarkButton, StatusBadge
│   │   └── forms/                    # LoginForm, RegisterForm (RHF + Zod)
│   │
│   ├── server/                       # Server-only layer (NEVER imported by client code)
│   │   ├── actions/                  # Next.js Server Actions (type-safe RPC)
│   │   │   ├── auth.actions.ts       # signIn, signUp, signOut
│   │   │   ├── university.actions.ts # getUniversities, getUniversityBySlug
│   │   │   └── bookmark.actions.ts   # addBookmark, removeBookmark
│   │   ├── services/                 # Business Logic Layer (SOLID: SRP)
│   │   │   ├── UniversityService.ts
│   │   │   ├── BookmarkService.ts
│   │   │   └── UserService.ts
│   │   └── repositories/             # Data Access Layer (Repository Pattern)
│   │       ├── interfaces/           # IUniversityRepository, IBookmarkRepository
│   │       ├── UniversityRepository.ts
│   │       └── BookmarkRepository.ts
│   │
│   ├── lib/                          # Shared utilities & config
│   │   ├── prisma.ts                 # DB client (primary + failover wrapper)
│   │   ├── auth.ts                   # BetterAuth instance
│   │   ├── auth-client.ts            # BetterAuth browser client
│   │   └── query-client.ts           # TanStack Query client
│   │
│   ├── schemas/                      # Zod schemas (Single Source of Truth)
│   │   ├── university.schema.ts
│   │   ├── bookmark.schema.ts
│   │   └── auth.schema.ts
│   │
│   ├── hooks/                        # Custom React hooks (client-side only)
│   │   ├── useUniversities.ts
│   │   └── useBookmarks.ts
│   │
│   ├── stores/                       # Zustand stores (client-only global state)
│   │   ├── compareStore.ts           # Compare drawer state (max 3 universities)
│   │   └── uiStore.ts                # Modal, sidebar open/close state
│   │
│   ├── types/                        # Global TypeScript types and interfaces
│   │   ├── university.types.ts
│   │   └── api.types.ts
│   │
│   └── env.ts                        # @t3-oss/env-nextjs validated env schema
│
├── prisma/
│   ├── schema.prisma                 # Single source of truth for DB structure
│   ├── migrations/                   # Version-controlled migration history
│   └── seed.ts                       # Database seeder script
│
├── public/                           # Static assets (logo, icons, og-images)
├── .env                              # Local secrets (gitignored)
├── .env.example                      # Checked-in env template
├── next.config.ts
├── tsconfig.json
└── vitest.config.ts
```

---

## 4. Environment Variables (`src/env.ts`)

All environment variables are **validated at build time** using `@t3-oss/env-nextjs`. If a variable is missing or malformed, the build fails immediately — preventing silent runtime errors in production.

```typescript
// src/env.ts
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    ACCELERATE_URL: z.string().startsWith("prisma://"),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    ACCELERATE_URL: process.env.ACCELERATE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
});
```

---

## 5. Database Layer

### 5.1 Prisma Schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String     @id @default(cuid())
  name          String
  email         String     @unique
  emailVerified Boolean    @default(false)
  image         String?
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  sessions      Session[]
  accounts      Account[]
  bookmarks     Bookmark[]
  suggestions   Suggestion[]

  @@map("users")
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model Account {
  id                    String    @id @default(cuid())
  userId                String
  accountId             String
  providerId            String
  accessToken           String?
  refreshToken          String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  idToken               String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("accounts")
}

model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@map("verifications")
}

model University {
  id          String    @id @default(cuid())
  slug        String    @unique
  nameAr      String
  nameEn      String
  type        UniversityType
  governorate String
  website     String?
  logoUrl     String?
  description String?
  established Int?
  majors      Major[]
  bookmarks   Bookmark[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([type])
  @@index([governorate])
  @@map("universities")
}

model Major {
  id           String     @id @default(cuid())
  nameAr       String
  nameEn       String
  slug         String
  universityId String
  university   University @relation(fields: [universityId], references: [id], onDelete: Cascade)
  duration     Int        // years
  degree       String
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  @@unique([slug, universityId])
  @@map("majors")
}

model Bookmark {
  id           String     @id @default(cuid())
  userId       String
  universityId String
  status       AppStatus  @default(INTERESTED)
  notes        String?
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  university   University @relation(fields: [universityId], references: [id], onDelete: Cascade)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  @@unique([userId, universityId])
  @@map("bookmarks")
}

model Suggestion {
  id        String           @id @default(cuid())
  userId    String
  content   String
  type      SuggestionType
  status    SuggestionStatus @default(PENDING)
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt

  @@map("suggestions")
}

enum UniversityType {
  PUBLIC
  PRIVATE
  NATIONAL
  INTERNATIONAL
}

enum AppStatus {
  INTERESTED
  RESEARCHING
  APPLIED
  ACCEPTED
  REJECTED
}

enum SuggestionType {
  DATA_CORRECTION
  MISSING_INFO
  NEW_UNIVERSITY
  GENERAL
}

enum SuggestionStatus {
  PENDING
  REVIEWED
  RESOLVED
}
```

### 5.2 Database Client with Primary/Failover (`src/lib/prisma.ts`)

```typescript
// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { withAccelerate } from "@prisma/extension-accelerate";
import { env } from "@/env";

// ── Primary: direct Neon connection via native driver ─────────────────────────
// Zero extra cost, lowest latency. Used on 100% of normal requests.
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
const primary = new PrismaClient({ adapter });

// ── Backup: Prisma Accelerate, lazy-init, kept warm once instantiated ─────────
// Created only on the first failure, not on every request.
let backup: (PrismaClient & ReturnType<typeof withAccelerate>) | null = null;

function getBackup() {
  if (!backup) {
    backup = new PrismaClient({
      datasources: { db: { url: env.ACCELERATE_URL } },
    }).$extends(withAccelerate());
  }
  return backup;
}

// ── Unified db() wrapper ──────────────────────────────────────────────────────
// Usage: const users = await db(c => c.user.findMany())
export async function db<T>(
  query: (client: PrismaClient) => Promise<T>
): Promise<T> {
  try {
    return await query(primary);
  } catch (err) {
    console.warn("[DB] Primary failed. Falling back to Accelerate:", err);
    return await query(getBackup() as unknown as PrismaClient);
  }
}
```

---

## 6. Zod Schema Validation (Single Source of Truth)

All data shapes are defined **once** in `/src/schemas/` and reused across Server Actions, forms, and API layers. This is the cornerstone of the SOLID Open/Closed Principle — shapes can be extended, not mutated.

```typescript
// src/schemas/university.schema.ts
import { z } from "zod";

export const UniversityTypeSchema = z.enum([
  "PUBLIC", "PRIVATE", "NATIONAL", "INTERNATIONAL"
]);

export const UniversitySchema = z.object({
  id: z.string().cuid(),
  slug: z.string().min(1).max(100),
  nameAr: z.string().min(1).max(200),
  nameEn: z.string().min(1).max(200),
  type: UniversityTypeSchema,
  governorate: z.string().min(1),
  website: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  description: z.string().max(2000).optional(),
  established: z.number().int().min(1800).max(2100).optional(),
});

export const UniversityFiltersSchema = z.object({
  type: UniversityTypeSchema.optional(),
  governorate: z.string().optional(),
  search: z.string().max(100).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type University = z.infer<typeof UniversitySchema>;
export type UniversityFilters = z.infer<typeof UniversityFiltersSchema>;
```

```typescript
// src/schemas/auth.schema.ts
import { z } from "zod";

export const SignUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});

export const SignInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type SignUpInput = z.infer<typeof SignUpSchema>;
export type SignInInput = z.infer<typeof SignInSchema>;
```

```typescript
// src/schemas/bookmark.schema.ts
import { z } from "zod";

export const AppStatusSchema = z.enum([
  "INTERESTED", "RESEARCHING", "APPLIED", "ACCEPTED", "REJECTED"
]);

export const CreateBookmarkSchema = z.object({
  universityId: z.string().cuid(),
  status: AppStatusSchema.default("INTERESTED"),
  notes: z.string().max(500).optional(),
});

export const UpdateBookmarkSchema = CreateBookmarkSchema
  .partial()
  .required({ universityId: true });

export type CreateBookmarkInput = z.infer<typeof CreateBookmarkSchema>;
export type UpdateBookmarkInput = z.infer<typeof UpdateBookmarkSchema>;
```

---

## 7. Repository Pattern (Data Access Layer)

The Repository pattern completely decouples the service layer from Prisma. If you ever change your ORM or database, only the repository files change — nothing else.

```typescript
// src/server/repositories/interfaces/IUniversityRepository.ts
import type { University, UniversityFilters } from "@/schemas/university.schema";

export interface IUniversityRepository {
  findAll(filters: UniversityFilters): Promise<University[]>;
  findBySlug(slug: string): Promise<University | null>;
  count(filters: UniversityFilters): Promise<number>;
}
```

```typescript
// src/server/repositories/UniversityRepository.ts
import { db } from "@/lib/prisma";
import type { IUniversityRepository } from "./interfaces/IUniversityRepository";
import type { University, UniversityFilters } from "@/schemas/university.schema";

export class UniversityRepository implements IUniversityRepository {
  async findAll(filters: UniversityFilters): Promise<University[]> {
    const { type, governorate, search, page, limit } = filters;
    return db((client) =>
      client.university.findMany({
        where: {
          ...(type && { type }),
          ...(governorate && { governorate }),
          ...(search && {
            OR: [
              { nameEn: { contains: search, mode: "insensitive" } },
              { nameAr: { contains: search } },
            ],
          }),
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { nameEn: "asc" },
      })
    ) as Promise<University[]>;
  }

  async findBySlug(slug: string): Promise<University | null> {
    return db((client) =>
      client.university.findUnique({ where: { slug } })
    ) as Promise<University | null>;
  }

  async count(filters: UniversityFilters): Promise<number> {
    const { type, governorate, search } = filters;
    return db((client) =>
      client.university.count({
        where: {
          ...(type && { type }),
          ...(governorate && { governorate }),
          ...(search && {
            OR: [
              { nameEn: { contains: search, mode: "insensitive" } },
              { nameAr: { contains: search } },
            ],
          }),
        },
      })
    );
  }
}
```

---

## 8. Service Layer (Business Logic)

Services use the Repository Interface (not concrete class), achieving Dependency Inversion (the D in SOLID). This makes services fully unit-testable with a mock repository.

```typescript
// src/server/services/UniversityService.ts
import type { IUniversityRepository } from "@/server/repositories/interfaces/IUniversityRepository";
import { UniversityFiltersSchema, type UniversityFilters } from "@/schemas/university.schema";

export class UniversityService {
  constructor(
    private readonly universityRepo: IUniversityRepository
  ) {}

  async getUniversities(rawFilters: unknown) {
    // Validate and parse filters using Zod — throws if invalid
    const filters = UniversityFiltersSchema.parse(rawFilters);

    const [universities, total] = await Promise.all([
      this.universityRepo.findAll(filters),
      this.universityRepo.count(filters),
    ]);

    return {
      data: universities,
      meta: {
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  }

  async getUniversityBySlug(slug: string) {
    const university = await this.universityRepo.findBySlug(slug);
    if (!university) throw new Error(`University not found: ${slug}`);
    return university;
  }
}
```

---

## 9. Server Actions (Type-Safe RPC Layer)

Server Actions replace both REST API routes and tRPC for the vast majority of use cases. They are co-located with Next.js and run only on the server.

```typescript
// src/server/actions/university.actions.ts
"use server";

import { UniversityRepository } from "@/server/repositories/UniversityRepository";
import { UniversityService } from "@/server/services/UniversityService";
import { UniversityFiltersSchema } from "@/schemas/university.schema";

// Compose once — following the Composition Root pattern
const universityService = new UniversityService(new UniversityRepository());

export async function getUniversitiesAction(rawFilters: unknown) {
  try {
    const filters = UniversityFiltersSchema.parse(rawFilters);
    return { success: true, data: await universityService.getUniversities(filters) };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred." };
  }
}
```

---

## 10. Authentication (BetterAuth)

```typescript
// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { primary } from "@/lib/prisma"; // Use the primary client directly for auth
import { env } from "@/env";

export const auth = betterAuth({
  database: prismaAdapter(primary, { provider: "postgresql" }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Enable after email provider is configured
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24,       // Refresh if older than 1 day
  },
});

export type Session = typeof auth.$Infer.Session;
```

```typescript
// src/lib/auth-client.ts (browser-only)
import { createAuthClient } from "better-auth/react";
import { env } from "@/env";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_APP_URL,
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

```typescript
// src/app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
```

---

## 11. Zustand Stores (Minimal Client State)

Only use client-side global state for UI state that cannot live on the server. University data lives in Server Components — only ephemeral UI state lives in Zustand.

```typescript
// src/stores/compareStore.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface CompareStore {
  selectedIds: string[];
  toggle: (id: string) => void;
  clear: () => void;
}

export const useCompareStore = create<CompareStore>()(
  devtools(
    persist(
      (set, get) => ({
        selectedIds: [],
        toggle: (id) =>
          set((state) => {
            if (state.selectedIds.includes(id)) {
              return { selectedIds: state.selectedIds.filter((s) => s !== id) };
            }
            if (state.selectedIds.length >= 3) {
              // Shift oldest out (FIFO queue)
              return { selectedIds: [...state.selectedIds.slice(1), id] };
            }
            return { selectedIds: [...state.selectedIds, id] };
          }),
        clear: () => set({ selectedIds: [] }),
      }),
      { name: "unicompass-compare" }
    )
  )
);
```

---

## 12. Routing & Caching Strategy

| Route | Strategy | Revalidation | Why |
| :--- | :--- | :--- | :--- |
| `/` | **SSG** | On deploy | Homepage never changes |
| `/universities` | **ISR** | 1 hour | List changes when scraper runs |
| `/universities/[slug]` | **ISR + generateStaticParams** | 1 hour | Pre-built for top unis, lazy for rest |
| `/majors/[slug]` | **ISR** | 1 hour | Same pattern as universities |
| `/dashboard` | **Dynamic** (Auth-protected) | Per request | User-specific data |
| `/about` | **SSG** | On deploy | Static content |

```typescript
// src/app/universities/[slug]/page.tsx
import { UniversityRepository } from "@/server/repositories/UniversityRepository";
import { notFound } from "next/navigation";

export const revalidate = 3600; // ISR: regenerate every 1 hour

export async function generateStaticParams() {
  const repo = new UniversityRepository();
  const universities = await repo.findAll({ page: 1, limit: 100 });
  return universities.map((u) => ({ slug: u.slug }));
}

export default async function UniversityPage({ params }: { params: { slug: string } }) {
  const repo = new UniversityRepository();
  const university = await repo.findBySlug(params.slug);
  if (!university) notFound();
  return <UniversityDetailView university={university} />;
}
```

---

## 13. Dashboard Protection (Middleware)

```typescript
// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const session = getSessionCookie(request);

  if (!session && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/?login=true", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

---

## 14. Testing Strategy

```bash
# Unit & Integration (Vitest)
npm run test

# End-to-End (Playwright)
npm run test:e2e
```

**Unit Tests:** Every Service class is tested against a mock Repository (no real DB calls).

```typescript
// src/server/services/UniversityService.test.ts
import { describe, it, expect, vi } from "vitest";
import { UniversityService } from "./UniversityService";
import type { IUniversityRepository } from "@/server/repositories/interfaces/IUniversityRepository";

const mockRepo: IUniversityRepository = {
  findAll: vi.fn().mockResolvedValue([]),
  findBySlug: vi.fn().mockResolvedValue(null),
  count: vi.fn().mockResolvedValue(0),
};

describe("UniversityService", () => {
  it("should return paginated results", async () => {
    const service = new UniversityService(mockRepo);
    const result = await service.getUniversities({ page: 1, limit: 10 });
    expect(result.meta.page).toBe(1);
    expect(mockRepo.findAll).toHaveBeenCalledOnce();
  });

  it("should throw if university is not found", async () => {
    const service = new UniversityService(mockRepo);
    await expect(service.getUniversityBySlug("invalid")).rejects.toThrow("not found");
  });
});
```

---

## 15. CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          ACCELERATE_URL: ${{ secrets.ACCELERATE_URL }}
          BETTER_AUTH_SECRET: ${{ secrets.BETTER_AUTH_SECRET }}
          BETTER_AUTH_URL: ${{ secrets.BETTER_AUTH_URL }}
          NEXT_PUBLIC_APP_URL: ${{ secrets.NEXT_PUBLIC_APP_URL }}
```

---

## 16. Phased Execution Roadmap

| Phase | Scope | Target |
| :--- | :--- | :--- |
| **Phase 0** | Scaffold project, configure env, Prisma schema, DB connection, BetterAuth | Week 1 |
| **Phase 1** | Port UI components (Navbar, Footer, Cards), homepage, university listing with SSG/ISR | Week 1–2 |
| **Phase 2** | University detail pages, Majors listing, Compare feature (Zustand store) | Week 2 |
| **Phase 3** | Auth flows (Sign Up / Sign In with BetterAuth), protected dashboard, Kanban board | Week 3 |
| **Phase 4** | Data seeding script (import legacy JSON → Neon Postgres), Prisma Accelerate failover wiring | Week 3 |
| **Phase 5** | User Suggestions feature, Email Verification, CI pipeline, E2E tests (Playwright) | Week 4 |
| **Phase 6** | Performance audit (Lighthouse CI), SEO (sitemap, metadata API, OG images), launch | Week 4 |

---

## 17. SOLID Design Principles Checklist

| Principle | How it's applied |
| :--- | :--- |
| **S**ingle Responsibility | Each class (Repository, Service, Action) has exactly one job |
| **O**pen/Closed | Zod schemas are extended with `.extend()`, not rewritten |
| **L**iskov Substitution | Services depend on `IUniversityRepository` interface, not concrete class |
| **I**nterface Segregation | `IUniversityRepository` only exposes what Services need |
| **D**ependency Inversion | Services receive repositories via constructor injection |

---

> [!IMPORTANT]
> **Next Step:** The `.env.example` file must be filled with real values before any `prisma migrate dev` command can be run. Obtain your `DATABASE_URL` from [Neon Console](https://console.neon.tech) and your `ACCELERATE_URL` from [Prisma Console](https://console.prisma.io) before execution starts.
