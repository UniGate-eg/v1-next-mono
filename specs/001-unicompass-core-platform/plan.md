# Implementation Plan: UniCompass Core University Guide Platform

**Branch**: `001-unicompass-core-platform` | **Date**: 2026-08-15 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/001-unicompass-core-platform/spec.md` and `implementation_plan.md`

---

## Summary

UniCompass is Egypt's first comprehensive university guide and college admission tracking platform. This implementation plan establishes the production-grade full-stack architecture based on the T3 philosophy (Next.js 15 App Router, TypeScript, Tailwind CSS, Prisma 6 ORM, PostgreSQL on Neon with Accelerate failover, BetterAuth, Zod, and Zustand), migrating from a legacy vanilla JS/PHP stack to a high-performance monolith capable of scaling to 100k+ concurrent users with zero fixed infrastructure costs during launch.

---

## Technical Context

**Language/Version**: TypeScript 5.5+ (strict mode enabled)  
**Primary Dependencies**: Next.js 15.3.x (App Router, Server Actions, React Server Components), React 19, Tailwind CSS 4.x, shadcn/ui, BetterAuth 1.x, Zod 3.24.x, Zustand 5.x, TanStack Query 5.x, React Hook Form 7.x  
**Storage**: PostgreSQL (Neon serverless with `@prisma/adapter-pg` native driver + Prisma Accelerate connection pool fallback), Prisma ORM 6.x  
**Testing**: Vitest (unit & service tests with mock repositories) + Playwright (E2E flows for public discovery, comparison, and auth/dashboard)  
**Target Platform**: Node.js 22 LTS / Edge CDN (Vercel deployment)  
**Project Type**: Monolithic Full-Stack Web Application (Next.js App Router)  
**Performance Goals**: <1.5s p95 TTFB on mobile 4G for catalog/detail pages; instant client drawer interactions; 100k+ concurrent read capacity via ISR edge caching (1-hour revalidation)  
**Constraints**: Zero fixed monthly infrastructure cost during initial launch phase; zero runtime errors via strict build-time env & Zod schema validation  
**Scale/Scope**: All major Egyptian higher education institutions (~80+ universities, ~1500+ majors/degrees across 27 governorates)

---

## Constitution Check

| Principle / Gate | Compliance Evaluation | Status |
| :--- | :--- | :---: |
| **Strict Layered Separation** | Presentation (`src/app/`, `src/components/`) → Type-Safe RPC (`src/server/actions/`) → Service Logic (`src/server/services/`) → Data Access (`src/server/repositories/`). Server-only code isolated under `src/server/`. | **PASS** |
| **Dependency Inversion** | Services depend strictly on repository interfaces (`IUniversityRepository`, `IBookmarkRepository`), enabling zero-DB mock testing. | **PASS** |
| **Single Source of Truth** | Zod schemas in `src/schemas/` govern validation across Server Actions, form inputs, and service logic without duplicate models. | **PASS** |
| **Type Safety & Build Verification** | `@t3-oss/env-nextjs` validates all environment secrets at build time; TypeScript strict mode eliminates runtime type surprises. | **PASS** |
| **Test-First & Coverage** | Service layers covered by Vitest unit tests with repository mocks; critical user journeys covered by Playwright E2E. | **PASS** |

---

## Project Structure

### Documentation (this feature)

```text
specs/001-unicompass-core-platform/
├── plan.md              # Complete Implementation Plan
├── research.md          # Architectural decisions and rationale
├── data-model.md        # Prisma ERD, entity schemas, and state transitions
├── contracts/           # Server Actions and BetterAuth API contracts
│   ├── server-actions.contract.md
│   └── auth.contract.md
├── quickstart.md        # Local setup, environment, migrations, seeding
├── checklists/
│   └── requirements.md  # Spec quality verification checklist
└── spec.md              # Feature specification
```

### Source Code Architecture (`src/`)

```text
unicompass/
├── src/
│   ├── app/                          # Next.js App Router (Presentation & Routing Layer)
│   │   ├── (marketing)/              # Route Group: Public SSG Pages
│   │   │   ├── page.tsx              # Homepage
│   │   │   └── about/page.tsx        # About UniCompass
│   │   ├── universities/             # Public University Catalog
│   │   │   ├── page.tsx              # University catalog list & filter (ISR: 3600s)
│   │   │   └── [slug]/page.tsx       # University detail view (ISR + generateStaticParams)
│   │   ├── majors/                   # Academic Majors Catalog
│   │   │   ├── page.tsx              # Majors directory
│   │   │   └── [slug]/page.tsx       # Major detail page
│   │   ├── dashboard/                # Protected Student Admission Tracker
│   │   │   ├── layout.tsx            # Session hydration & auth guard
│   │   │   ├── page.tsx              # Kanban application tracking board
│   │   │   └── settings/page.tsx     # Student profile & notification settings
│   │   ├── api/
│   │   │   └── auth/[...all]/route.ts# BetterAuth HTTP Route Handler
│   │   ├── layout.tsx                # Root layout (fonts, providers, metadata)
│   │   ├── globals.css               # Global styles and Tailwind tokens
│   │   └── not-found.tsx             # 404 handler
│   │
│   ├── components/                   # UI Component Library (Atomic Design)
│   │   ├── ui/                       # shadcn/ui primitives (Button, Card, Dialog, Badge, Input...)
│   │   ├── layout/                   # Navbar, Footer, MobileNav, SearchHeader
│   │   ├── university/               # UniversityCard, UniversityFilters, CompareDrawer, MajorList
│   │   ├── dashboard/                # KanbanBoard, KanbanColumn, BookmarkCard, NoteDialog
│   │   └── forms/                    # LoginForm, RegisterForm, SuggestionForm (RHF + Zod)
│   │
│   ├── server/                       # Server-Only Layer (Enforced by Next.js Server Boundary)
│   │   ├── actions/                  # Next.js Server Actions (Type-safe RPC)
│   │   │   ├── university.actions.ts # getUniversitiesAction, getUniversityBySlugAction
│   │   │   ├── bookmark.actions.ts   # createBookmarkAction, updateBookmarkAction, deleteBookmarkAction
│   │   │   └── suggestion.actions.ts # submitSuggestionAction
│   │   ├── services/                 # Pure Business Logic Layer (SOLID SRP & DIP)
│   │   │   ├── UniversityService.ts  # Filter orchestration, pagination, slug lookup
│   │   │   ├── BookmarkService.ts    # Application status transitions, note persistence
│   │   │   └── SuggestionService.ts  # Feedback ingestion and categorization
│   │   └── repositories/             # Data Access Layer (Repository Pattern)
│   │       ├── interfaces/           # IUniversityRepository, IBookmarkRepository, ISuggestionRepository
│   │       ├── UniversityRepository.ts
│   │       ├── BookmarkRepository.ts
│   │       └── SuggestionRepository.ts
│   │
│   ├── lib/                          # Shared Core Utilities & Singletons
│   │   ├── prisma.ts                 # Database Client with Neon primary + Accelerate failover
│   │   ├── auth.ts                   # BetterAuth server-side configuration
│   │   ├── auth-client.ts            # BetterAuth React client methods
│   │   ├── query-client.ts           # TanStack Query client instantiation
│   │   └── utils.ts                  # cn() class merger and string utilities
│   │
│   ├── schemas/                      # Single Source of Truth Zod Validation Schemas
│   │   ├── university.schema.ts      # University, Major, Filters schemas
│   │   ├── bookmark.schema.ts        # Bookmark, AppStatus schemas
│   │   ├── auth.schema.ts            # SignUp, SignIn credentials schemas
│   │   └── suggestion.schema.ts      # Suggestion submission schema
│   │
│   ├── hooks/                        # Custom Client-Side React Hooks
│   │   ├── useUniversities.ts        # TanStack query wrapper for catalog filtering
│   │   └── useBookmarks.ts           # Optimistic Kanban mutation hooks
│   │
│   ├── stores/                       # Zustand Global Client State
│   │   ├── compareStore.ts           # Comparison tray selection (max 3, FIFO, persisted)
│   │   └── uiStore.ts                # Search modal, filter sidebar open/close state
│   │
│   ├── types/                        # Global Shared Types
│   │   ├── university.types.ts
│   │   └── api.types.ts
│   │
│   ├── env.ts                        # @t3-oss/env-nextjs build-time environment schema
│   └── middleware.ts                 # BetterAuth route guard middleware
│
├── prisma/
│   ├── schema.prisma                 # Database schema definitions
│   ├── migrations/                   # Migration historical ledger
│   └── seed.ts                       # Comprehensive Egyptian university database seeder
│
├── public/                           # Static assets, university logos, OG social images
├── tests/
│   ├── unit/                         # Vitest unit tests (Services with Mock Repositories)
│   │   ├── UniversityService.test.ts
│   │   └── BookmarkService.test.ts
│   └── e2e/                          # Playwright end-to-end integration tests
│       ├── catalog-search.spec.ts
│       ├── university-compare.spec.ts
│       └── student-dashboard.spec.ts
│
├── .env.example                      # Checked-in environment variable template
├── next.config.ts                    # Next.js configuration
├── tsconfig.json                     # TypeScript strict configuration
└── vitest.config.ts                  # Vitest runner configuration
```

---

## Phased Execution Roadmap

| Phase | Core Objective | Key Deliverables |
| :--- | :--- | :--- |
| **Phase 0** | Foundation & Project Bootstrap | Next.js 15 app scaffolding, `@t3-oss/env-nextjs` validation, Prisma 6 schema with Neon/Accelerate failover client, BetterAuth setup. |
| **Phase 1** | Public Discovery & Catalog | UniversityRepository & Service, bilingual full-text search, governorate & type filters, UniversityCard, public `/universities` catalog with ISR. |
| **Phase 2** | Detail Pages & Comparison Matrix | University profile views with academic majors, Zustand `compareStore` (up to 3 universities, FIFO), sticky comparison drawer and side-by-side matrix view. |
| **Phase 3** | Authentication & Kanban Dashboard | BetterAuth credentials sign-in/up forms, `/dashboard` route guard, Kanban board with drag/status updates (`Interested` → `Applied`), student note modal. |
| **Phase 4** | Data Seeding & High Availability | Production-ready seed script populating 80+ Egyptian universities and majors, Prisma failover verification. |
| **Phase 5** | Crowdsourced Corrections & Testing | Community suggestions form & service, Vitest unit test suite with mock repositories, Playwright E2E test suite. |
| **Phase 6** | Performance & SEO Optimization | Dynamic sitemap, OpenGraph metadata, bilingual Arabic/English font optimization, production build verification. |

---

## Complexity Tracking

| Architectural Pattern | Why Needed | Simpler Alternative Rejected Because |
| :--- | :--- | :--- |
| **Repository Pattern** | Decouples business logic from Prisma ORM; enables fast isolated unit testing via in-memory mocks without live database dependencies. | Direct Prisma calls in Server Actions make automated unit testing impossible without hitting a real PostgreSQL instance. |
| **Neon + Prisma Accelerate Fallback** | Ensures high availability: zero-cost serverless Neon primary for standard traffic, automatic fallback to Accelerate connection pool during viral admission result spikes. | Single standard connection pool either exhausts connections or incurs continuous fixed monthly proxy server costs. |
| **Zustand `localStorage` Persistence for Compare** | Preserves student's active comparisons across tabs and navigation without requiring database transactions or user login. | Database-backed comparison adds unnecessary database writes for anonymous exploratory visitors. |
