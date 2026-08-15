# Research & Architectural Decisions: UniCompass Core Platform

**Feature**: UniCompass Core University Guide Platform (`001-unicompass-core-platform`)  
**Date**: 2026-08-15  
**Author**: Principal Full-Stack SWE  

---

## 1. Full-Stack Framework & Rendering Strategy

- **Decision**: Next.js 15 (App Router) with React Server Components (RSC) and Server Actions.
- **Rationale**:
  - Delivers SSG/ISR for university catalog pages (1-hour revalidation) and static marketing pages, achieving near-zero TTFB on edge CDNs.
  - Server Actions provide end-to-end type safety directly with Zod schemas without needing an extra API gateway layer or heavy RPC boilerplate.
  - Vercel native zero-cold-start hosting with free-tier edge caching.
- **Alternatives Considered**:
  - *Vite + SPA + Express/Fastify API*: Requires managing separate deployments, CORS configuration, manual client data fetching waterfalls, and loses SEO/SSG capabilities critical for university discovery in search engines.
  - *Next.js Pages Router + tRPC*: Pages router is legacy; tRPC adds type-safe RPC but Next.js Server Actions with Zod achieve identical type safety with lower runtime overhead and native RSC integration.

---

## 2. Database, ORM & High-Availability Driver Architecture

- **Decision**: PostgreSQL on Neon (Serverless) managed with Prisma ORM 6.x using `@prisma/adapter-pg` (native `pg` driver) and a lazy-initialized fallback to Prisma Accelerate.
- **Rationale**:
  - Neon Postgres provides zero-cost serverless branching, auto-suspend, and generous free tier for 100k+ monthly page views.
  - Native driver adapter (`@prisma/adapter-pg`) avoids standard HTTP proxies during normal operation, ensuring lowest query latency.
  - Unified database client (`db(client => ...)`) provides automated fallback to Prisma Accelerate if primary connection pool exhaust occurs under sudden viral traffic bursts.
- **Alternatives Considered**:
  - *Raw Supabase Client / PostgREST*: Less control over repository layer abstraction and decoupled TypeScript domain models.
  - *Drizzle ORM*: Fast, but Prisma's migration tooling and multi-adapter failover ecosystem provide higher operational resilience for this project structure.

---

## 3. Authentication & Session Management

- **Decision**: BetterAuth 1.x with Prisma Adapter and secure HttpOnly cookie session management.
- **Rationale**:
  - Modern, lightweight, framework-native authentication library built for Next.js App Router.
  - First-class Prisma adapter that seamlessly integrates with existing PostgreSQL user/session/account schema.
  - Native support for email/password credentials with built-in rate limiting and future extension capability (Google OAuth, magic links, email verification).
- **Alternatives Considered**:
  - *NextAuth.js (Auth.js v5)*: Slower release cadence, complex configuration with Next.js 15 Server Actions, breaking schema changes across minor versions.
  - *Clerk / Supabase Auth*: Third-party vendor lock-in with steep pricing cliffs past free-tier user thresholds.

---

## 4. State Management & Client-Side Data Caching

- **Decision**: Zustand 5.x for ephemeral client UI state (University Comparison Drawer, sidebar toggles) + TanStack Query 5.x for client-side optimistic UI updates on the student Kanban dashboard.
- **Rationale**:
  - Server components handle 95% of data fetching directly on the server without client state overhead.
  - Zustand (`persist` middleware) easily retains up to 3 compared universities in browser `localStorage` across page reloads.
  - TanStack Query gives instant optimistic drag-and-drop feedback for application stage transitions (`Interested` → `Applied`).
- **Alternatives Considered**:
  - *Redux Toolkit*: Overkill boilerplate for lightweight comparison and UI drawer state.
  - *React Context API*: Causes unnecessary full-tree re-renders on high-frequency comparison drawer toggles.

---

## 5. UI Component Architecture & Styling

- **Decision**: Tailwind CSS 4.x + shadcn/ui headless accessible components + Lucide Icons.
- **Rationale**:
  - Utility-first CSS with zero runtime bundle overhead.
  - shadcn/ui components are copied directly into `src/components/ui/` with full ownership and customization flexibility.
  - Accessible ARIA compliance (Radix UI primitives under the hood) across mobile, tablet, and desktop viewports.
- **Alternatives Considered**:
  - *Material UI / Ant Design*: Heavy JavaScript runtime bundles, difficult CSS override battles, rigid design aesthetics.
  - *Pure CSS Modules*: Slower developer velocity for responsive responsive grids and interactive drawers.

---

## 6. Architecture & SOLID Separation of Concerns

- **Decision**: Strict 4-tier layered architecture:
  1. **Presentation**: Next.js App Router (`src/app/`) + UI Components (`src/components/`)
  2. **Type-Safe RPC**: Server Actions (`src/server/actions/`)
  3. **Domain Business Logic**: Services (`src/server/services/`) with constructor injection
  4. **Data Access**: Repositories (`src/server/repositories/`) implementing explicit TypeScript interfaces (`src/server/repositories/interfaces/`)
- **Rationale**:
  - **Single Responsibility Principle (SRP)**: Repositories only query data; Services only execute business logic and validation; Server Actions only handle RPC dispatch and error sanitization.
  - **Dependency Inversion Principle (DIP)**: Services depend on `IUniversityRepository` and `IBookmarkRepository` interfaces, enabling instant unit testing via Vitest mocks without requiring a live database.
  - **Open/Closed Principle (OCP)**: Shared Zod schemas in `src/schemas/` serve as single sources of truth.
