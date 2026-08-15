# Feature Specification: UniCompass Core University Guide Platform

**Feature Branch**: `001-unicompass-core-platform`  
**Created**: 2026-08-15  
**Status**: Draft  
**Input**: User description: "UniCompass Egypt University Guide Platform migration and core feature set based on implementation_plan.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Bilingual University & Major Discovery (Priority: P1)

Prospective students and parents can discover, search, and explore higher education institutions across Egypt with authoritative bilingual details (Arabic and English) without requiring an account.

**Why this priority**: Core value proposition of the platform. Without high-quality search, filtering, and detailed institution profiles, secondary features like comparing or tracking applications have no foundation.

**Independent Test**: Can be fully tested by navigating to the public university catalog, applying type and governorate filters, searching for an institution in Arabic or English, and opening a comprehensive university profile page displaying all associated majors and metadata.

**Acceptance Scenarios**:

1. **Given** a visitor on the university directory, **When** they filter by university type (e.g., "National") and governorate (e.g., "Giza"), **Then** the listing displays only institutions matching both criteria with total result counts.
2. **Given** a visitor searching in Arabic (e.g., "جامعة القاهرة") or English (e.g., "Cairo University"), **When** the query is executed, **Then** matching universities are returned with highlighted names, location, and type tags.
3. **Given** a visitor selecting a specific university, **When** the profile page opens, **Then** the page displays the official bilingual names, establishment year, institution type, governorate, website link, overview description, and an exhaustive list of offered faculties/majors with degree types and durations in years.
4. **Given** a visitor browsing a non-existent or retired university URL slug, **When** the page loads, **Then** the system presents a helpful "institution not found" state with a clear link back to the directory.

---

### User Story 2 - Side-by-Side Multi-University Comparison (Priority: P2)

Students evaluating multiple university options can select up to 3 institutions and compare their core characteristics side-by-side in a comparative view.

**Why this priority**: Choosing a higher education path involves trade-offs (governorate distance, private vs. national tuition/type, available specialized majors). A comparison tool significantly reduces student decision fatigue.

**Independent Test**: Can be fully tested by selecting 2 or 3 universities from directory cards or profile pages, launching the comparison drawer/view, verifying side-by-side dimension alignment, and swapping or clearing selections.

**Acceptance Scenarios**:

1. **Given** a visitor browsing universities, **When** they toggle the "Compare" action on an institution, **Then** the university is added to the active comparison list and the comparison drawer indicator updates.
2. **Given** an active comparison containing 3 universities, **When** the user attempts to add a 4th university, **Then** the system replaces the oldest selected university (First-In, First-Out) and alerts the user of the update.
3. **Given** 2 or 3 universities in comparison, **When** the user opens the comparison view, **Then** the system renders a matrix comparing type, governorate, establishment year, major offerings, degree levels, and direct official website links side by side.
4. **Given** universities in the comparison tray, **When** the user navigates across different pages or refreshes the session, **Then** their comparison selections remain intact.

---

### User Story 3 - Personalized Student Application Tracker & Kanban Dashboard (Priority: P3)

Registered students can bookmark universities and organize their college admission pipeline across custom application stages with personal notes.

**Why this priority**: Empowers applicants through their multi-month college admissions cycle, transforming UniCompass from a one-time directory into a continuous decision-making companion.

**Independent Test**: Can be fully tested by registering an account, bookmarking a university, moving the university between application stages (`Interested` → `Researching` → `Applied` → `Accepted` / `Rejected`), and adding notes that persist across logins.

**Acceptance Scenarios**:

1. **Given** a registered user viewing a university, **When** they click "Bookmark / Save", **Then** the institution is added to their private admission tracking dashboard in the default "Interested" stage.
2. **Given** a logged-in user on their dashboard, **When** they move an application card from "Interested" to "Applied", **Then** the status updates immediately and persists across device reloads.
3. **Given** a saved application card, **When** the student enters custom notes (e.g., entrance exam dates, submission deadlines, required paperwork), **Then** the notes are saved and remain accessible only to that student.
4. **Given** an unauthenticated visitor attempting to access the dashboard URL, **When** the page is requested, **Then** the system prompts the user to sign in or register before granting access.

---

### User Story 4 - Community Feedback & Missing Information Suggestions (Priority: P4)

Students and university community members can submit corrections for outdated data, missing majors, or unlisted universities to keep directory content reliable and up to date.

**Why this priority**: Higher education programs, accreditation statuses, and degree requirements evolve continuously. Crowdsourced submissions enable rapid identification of data discrepancies.

**Independent Test**: Can be fully tested by submitting a structured data suggestion form and verifying that the submission is recorded with appropriate categorization and initial pending status.

**Acceptance Scenarios**:

1. **Given** an authenticated student reviewing a university profile, **When** they submit a suggestion indicating a missing major or outdated contact link, **Then** the submission is confirmed with a receipt acknowledgment.
2. **Given** an incoming suggestion, **When** the system accepts it, **Then** it categorizes the entry (`Data Correction`, `Missing Information`, `New University`, or `General`) and marks its initial workflow status as `Pending`.

---

### Edge Cases

- What happens when a user searches in Arabic using differing orthographic forms (e.g., "أ", "إ", "ا", "ة", "ه")?  
  The search system must normalize common Arabic character variants to ensure relevant results match regardless of spelling variations.
- What happens when a university offers dozens of majors across multiple faculties?  
  The major catalog on the university profile must support searchable filtering and grouped categorization by discipline so users can navigate without excessive scrolling.
- What happens if a user is disconnected while updating their application stage or notes on the dashboard?  
  The interface must indicate connection loss, prevent silent data loss, and allow retry once network connectivity is restored.
- What happens if a user attempts to bookmark the same university multiple times?  
  The system treats bookmarking as an idempotent toggle or opens the existing application card, preventing duplicate entries for the same institution.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a public university catalog filterable by university type (`Public`, `Private`, `National`, `International`) and Egyptian governorate.
- **FR-002**: System MUST support bilingual full-text search across institution English names, Arabic names, and descriptions.
- **FR-003**: System MUST display dedicated university profile pages containing institution type, governorate, year established, official website URL, logo, description, and an exhaustive list of associated academic majors.
- **FR-004**: System MUST display major details including major title in Arabic and English, degree type awarded (e.g., Bachelor of Science), and standard program duration in years.
- **FR-005**: System MUST allow users to select up to 3 institutions for simultaneous side-by-side comparison.
- **FR-006**: System MUST persist active university comparisons across page navigation within the user's browser session.
- **FR-007**: System MUST provide user account registration, authentication, and secure session management.
- **FR-008**: System MUST provide authenticated users with a personalized admissions tracking dashboard featuring customizable application statuses: `Interested`, `Researching`, `Applied`, `Accepted`, and `Rejected`.
- **FR-009**: System MUST allow authenticated users to save private textual notes for each tracked university application.
- **FR-010**: System MUST enforce that application tracking data and private notes are accessible only by the owner of the account.
- **FR-011**: System MUST allow authenticated users to submit structured community suggestions categorized into `Data Correction`, `Missing Information`, `New University`, and `General`.
- **FR-012**: System MUST track the lifecycle of community suggestions through `Pending`, `Reviewed`, and `Resolved` states.
- **FR-013**: System MUST render all public pages and catalog views responsively across mobile, tablet, and desktop viewports.

### Key Entities

- **User**: Represents a registered platform participant. Includes name, email address, authentication verification status, profile avatar, and account creation timestamp.
- **University**: Represents a higher education institution in Egypt. Includes unique identifier, slug, Arabic name, English name, institution classification (`Public`, `Private`, `National`, `International`), governorate, official website link, logo image reference, overview description, year established, and associated academic majors.
- **Major / Program**: Represents an academic degree program offered by a university. Includes Arabic title, English title, unique slug per university, parent university reference, standard duration in years, and degree awarded.
- **Tracked Application (Bookmark)**: Represents a student's relationship with a university in their admissions pipeline. Includes referencing user, referencing university, current status (`Interested`, `Researching`, `Applied`, `Accepted`, `Rejected`), personal student notes, and timestamp updates.
- **Community Suggestion**: Represents user-submitted feedback on platform data. Includes submitting user reference, detailed description/content, suggestion category (`Data Correction`, `Missing Information`, `New University`, `General`), review status (`Pending`, `Reviewed`, `Resolved`), and submission timestamp.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Visitors can locate any Egyptian university in the catalog using type/governorate filters or search keywords within 3 interactions or under 5 seconds.
- **SC-002**: 100% of university profile pages display bilingual names, governorate, institution type, and structured academic major listings.
- **SC-003**: Users can initiate and view a side-by-side comparison of 2 to 3 universities in under 2 clicks from the directory or detail views.
- **SC-004**: Registered students can add a university to their admissions tracker and update its status in under 3 seconds.
- **SC-005**: Public university catalog and detail views load and render readable content in under 1.5 seconds on standard 4G mobile connections.
- **SC-006**: 95% of first-time users can successfully navigate from the homepage to a university's specific major requirements without seeking external help.

---

## Assumptions

- **Target Audience**: Primary users are Egyptian high school students (Thanaweya Amma, STEM, IGCSE, American Diploma, Azhar), university transfer students, and parents seeking verified Egyptian university admissions information.
- **Language Requirements**: The user interface and underlying university data must support both Arabic and English seamlessly.
- **Data Scope**: Version 1 encompasses Egyptian higher education institutions (Public universities, Private universities, National/Ahleya universities, and International branch campuses located in Egypt).
- **Authentication**: Email and password authentication is the baseline authentication mechanism for version 1, with session security adhering to industry standard token expiration and renewal practices.
- **Public Accessibility**: Directory browsing, searching, filtering, detail viewing, and multi-university comparison are completely accessible without mandatory login.
