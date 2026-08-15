# Quickstart Guide: UniCompass Core Platform

**Feature**: UniCompass Core University Guide Platform (`001-unicompass-core-platform`)  

---

## 1. Prerequisites

- **Node.js**: `v20.x` or `v22.x` (LTS)
- **Package Manager**: `npm`
- **PostgreSQL Database**: Neon serverless database instance (or local PostgreSQL)
- **Optional Failover**: Prisma Accelerate API key

---

## 2. Environment Setup

Create `.env` in project root:

```env
# Database Connections
DATABASE_URL="postgresql://user:password@ep-sample-neon-pooler.us-east-2.aws.neon.tech/unicompass?sslmode=require"
ACCELERATE_URL="prisma://accelerate.prisma-data.net/?api_key=your_accelerate_key"

# Authentication (BetterAuth)
BETTER_AUTH_SECRET="min-32-chars-cryptographically-secure-random-string"
BETTER_AUTH_URL="http://localhost:3000"

# Application Base URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 3. Installation & Database Setup

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Apply migrations to database
npx prisma migrate dev --name init

# 4. Seed database with Egyptian universities and majors catalog
npm run db:seed
```

---

## 4. Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser:
- Public Catalog: `/universities`
- Compare Drawer: Available across all university cards
- Student Dashboard: `/dashboard` (Auth required)

---

## 5. Testing & Quality Checks

```bash
# Run unit & integration tests (Vitest)
npm run test

# Run end-to-end tests (Playwright)
npm run test:e2e

# Run linter
npm run lint

# Run type check
npm run type-check
```
