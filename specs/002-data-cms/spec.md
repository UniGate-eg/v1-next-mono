# Feature Specification: Production Data Architecture & Admin CMS Suite

**Feature Branch**: `002-data-cms`  
**Created**: 2026-08-17  
**Status**: Draft  
**Input**: User description: "Production Data Architecture, Database Normalization, Automated ETL Ingestion Pipeline, Admin CMS Management Suite, and On-Demand Cache Invalidation System"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Real-Time University & Program Data Management (Priority: P1)

As a platform administrator or university admissions editor, I want to create, inspect, update, and publish university profiles, faculties, degree programs, and annual tuition rates through an intuitive visual dashboard, so that prospective students always have access to accurate, up-to-date academic and financial information without requiring software engineering interventions.

**Why this priority**: Directly solves the critical platform limitation where university data was static, hardcoded, and unmaintainable without code changes and full application redeployments.

**Independent Test**: An authorized administrator logs in, updates a university's tuition range and faculty dean details via the admin portal, saves changes, and immediately verifies that public-facing directory cards and profile modals reflect the updated values with zero server restarts.

**Acceptance Scenarios**:
1. **Given** an authenticated administrator on the university editor screen, **When** they update the annual tuition from 75,000 EGP to 85,000 EGP and click "Save Changes", **Then** the record is updated in the persistent datastore, and public search/catalog queries immediately serve the updated tuition.
2. **Given** an administrator adding a new degree program under an existing faculty, **When** they submit the bilingual name, study duration, degree type, and career prospects, **Then** the program appears nested under that faculty in both English and Arabic views.
3. **Given** an unauthenticated or non-admin user attempting to access the administration portal, **When** they request any management route, **Then** access is denied and they are redirected to a secure sign-in screen.

---

### User Story 2 - Instant Search & Low-Bandwidth Profile Delivery (Priority: P1)

As a high school student browsing university options on mobile data, I want instant search auto-completion across universities and majors with minimal cellular data consumption, so that I can explore programs rapidly even under low-connectivity conditions.

**Why this priority**: Eliminates multi-megabyte client bundle bloat, ensuring optimal Core Web Vitals, sub-second mobile page loads, and instantaneous discovery.

**Independent Test**: Load the marketing homepage and catalog on a throttled mobile network; verify that initial page payload is under 150 KB, search auto-complete responds in under 50ms, and complete faculty structures load on demand.

**Acceptance Scenarios**:
1. **Given** a visitor typing a major name (e.g., "Artificial Intelligence") into the search bar, **When** they type at least 2 characters, **Then** matching universities and specific programs are suggested instantly without full-page reloads or multi-megabyte payloads.
2. **Given** a visitor clicking "View Details" on any university card, **When** the modal opens, **Then** exhaustive faculty, dean, accreditation, and contact data are retrieved smoothly and displayed in the user's selected language.

---

### User Story 3 - Community Data Correction & Verification Pipeline (Priority: P2)

As a university student or faculty member who spots outdated admission criteria or tuition fees, I want to submit a structured correction with notes, and as an administrator, I want to review, compare, and merge or reject these suggestions with a single click.

**Why this priority**: Enables community-driven data accuracy and crowd-sourced verification, keeping hundreds of university programs accurate over time.

**Independent Test**: Submit a suggestion for a specific university as a registered user, review it in the admin moderation queue, approve the proposed changes, and verify the university profile is automatically updated.

**Acceptance Scenarios**:
1. **Given** a registered student reviewing a university profile, **When** they submit a correction noting a new accredited program, **Then** the suggestion is queued in the moderation inbox with status "Pending".
2. **Given** an administrator reviewing pending suggestions, **When** they click "Approve & Apply", **Then** the target university record updates automatically, the suggestion status transitions to "Resolved", and the submitting user is credited.

---

### User Story 4 - Automated Exhaustive Data Ingestion & Sync (Priority: P2)

As a platform operations engineer, I want an automated, idempotent ingestion pipeline that parses, validates, and normalizes large external datasets (containing 30+ universities, 400+ degree programs, deans, accreditations, and dual-degree partnerships) into structured records without manual data entry.

**Why this priority**: Allows immediate populating and periodic re-synchronization of exhaustive nationwide datasets while guaranteeing data integrity.

**Independent Test**: Execute the ingestion process against the raw dataset; verify that all entities, faculties, and degree programs are inserted/updated with zero duplicate records and zero validation errors.

**Acceptance Scenarios**:
1. **Given** an raw dataset containing nested faculties, deans, and degree programs, **When** the ingestion routine executes, **Then** all universities and their hierarchical relationships are persisted with relational integrity.
2. **Given** a re-run of the ingestion pipeline on an already populated database, **When** existing entities are encountered, **Then** the system updates existing records without generating duplicate identifiers or corrupting associations.

---

### User Story 5 - Operational Audit Logging & Snapshot Exports (Priority: P3)

As a lead platform administrator, I want a complete audit log of all data modifications and the ability to export full database snapshots in standard formats, so that administrative changes are accountable and backups can be taken at any time.

**Why this priority**: Provides governance, accountability, and offline portability for university datasets.

**Independent Test**: Perform several administrative updates, verify corresponding entries in the audit trail, and download a complete JSON snapshot.

**Acceptance Scenarios**:
1. **Given** an admin modifying a university profile, **When** the update succeeds, **Then** an immutable audit record is logged capturing the administrator identity, timestamp, modified fields, and previous values.
2. **Given** an admin requesting a data export, **When** they click "Export Database Snapshot", **Then** a structured export file containing all universities, faculties, and programs is generated for download.

---

### Edge Cases

- **Concurrent Admin Edits**: When two administrators edit the same university simultaneously, the system must detect version conflicts and warn the second administrator rather than silently overwriting changes.
- **Partial/Corrupted External Ingestion Records**: When the ingestion pipeline encounters a malformed record (e.g., missing mandatory name or negative tuition values), the system must log the invalid record to an error log, skip only that item, and continue processing remaining records.
- **Bilingual Field Fallback**: When an administrative record contains only English text for a newly added field, the Arabic user interface must cleanly display the available text without throwing runtime render errors.
- **Offline / Degraded Database State**: When the primary persistent datastore is temporarily unreachable, public read requests must gracefully serve cached or fallback data without displaying broken error screens.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a centralized relational datastore supporting hierarchical academic data: Institution -> Faculty -> Degree Program -> Career Outcomes.
- **FR-002**: System MUST support bilingual (Arabic and English) attributes for all text entities including institution names, overviews, faculty descriptions, and degree titles.
- **FR-003**: System MUST store annual tuition figures as structured numeric ranges (minimum/maximum in local and foreign currencies) to enable numerical filtering, comparison, and sorting.
- **FR-004**: System MUST provide role-based access control, restricting data mutation and administration endpoints exclusively to authorized administrator roles.
- **FR-005**: System MUST provide an administrative dashboard allowing authorized personnel to list, filter, search, create, edit, archive, and publish university profiles.
- **FR-006**: System MUST provide dedicated management interfaces for nested faculties (with deans and departments) and degree programs (with durations, degrees, tuition, and dual-degree partners).
- **FR-007**: System MUST automatically purge and update cached public representations immediately upon administrative data saves, achieving live updates without application rebuilds.
- **FR-008**: System MUST generate and maintain a lightweight client search index (under 40 KB payload) enabling zero-latency auto-complete on the client side.
- **FR-009**: System MUST support paginated data delivery for the public catalog, restricting initial server payload to under 150 KB per page view.
- **FR-010**: System MUST provide a public "Suggest Data Correction" submission mechanism linked to specific universities.
- **FR-011**: System MUST provide an administrative moderation queue to inspect, compare, approve, or reject community suggestions.
- **FR-012**: System MUST record immutable audit log entries for all administrative creation, modification, and deletion events.
- **FR-013**: System MUST provide an automated, idempotent ingestion utility to import raw exhaustive university JSON datasets into the relational schema.
- **FR-014**: System MUST allow administrators to export complete structured snapshots of university data on demand.
- **FR-015**: System MUST maintain operational read resiliency, falling back gracefully to static datasets if primary storage connection drops.

---

### Key Entities

- **University**: Represents a higher education institution with institutional attributes (bilingual names, slug, educational model, type, governorate, city, addresses, overview, rankings, contact information, social links, accreditation lists, publish status).
- **Faculty**: Represents an academic division or college within a university (bilingual names, descriptions, dean name, department listings).
- **DegreeProgram**: Represents a specific academic degree offered by a faculty or university (bilingual degree names, degree level, duration in years, study language, numeric annual tuition in EGP/USD, career opportunities, dual-degree international partner).
- **Accreditation**: Represents formal institutional or specialized programmatic accreditations (accreditation body name, recognition scope).
- **Suggestion**: Represents a crowdsourced data modification proposal submitted by a user against a target university (category, proposed changes, verification evidence, review status).
- **AuditLog**: Represents an immutable operational event (actor ID, target entity, action type, before/after payload, timestamp).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrators can update university profile data, tuition rates, or degree programs with changes reflected across public pages in **under 2 seconds** without code deployment.
- **SC-002**: Initial public page payload size is reduced from **>8.0 MB** to **<150 KB**, achieving a **95%+ reduction** in client-side data transfer.
- **SC-003**: Search auto-complete response time on client devices is **under 50ms** across all universities and majors.
- **SC-004**: Ingestion pipeline imports 30+ universities and 400+ degree programs in **under 30 seconds** with zero data loss or duplicate records.
- **SC-005**: 100% of administrative mutation events produce a verifiable audit trail record.
- **SC-006**: Public catalog and profile discovery achieve **100/100 Core Web Vitals** performance score on standard mobile audits.

---

## Assumptions

- **Authentication Infrastructure**: The platform's existing authentication system (BetterAuth) is leveraged to provide user identification and session management for administrative authorization.
- **Database Availability**: A PostgreSQL-compatible relational database is provisioned and accessible via standard connection pooling.
- **Language Support**: English and Arabic are the two primary languages required for all academic profiles; right-to-left (RTL) layout switching is fully handled by the existing design system.
- **Asset Hosting**: University logos and external media assets continue to be served via optimized web assets in `public/` or cloud storage buckets.
