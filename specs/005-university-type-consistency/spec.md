# Feature Specification: University Type Consistency

**Feature Branch**: `005-university-type-consistency`  
**Created**: 2026-09-13  
**Status**: Draft  
**Clarifications (2026-09-13)**: Q1 — Classification authority → Option A: follow the Ministry of Higher Education category exactly; International only for foreign branch campuses.  
**Input**: User description: "Make a spec about the University {Private - Public - National} badge inconsistency issues: International institutions are recorded as National during import; missing types default to Public in some places and Private in others; type labels are defined in several places that disagree (one includes a 'Technological' type that does not exist); type filter links use different casings so filters appear inactive or cannot be cleared; some institutions are misclassified (e.g. Nile University recorded as Private while its own Arabic description calls it أهلية); the 'Public' filter is offered while no public universities exist in the catalog; the university detail page shows the type in English for Arabic users; and some pages read a stale snapshot of the catalog so badges can differ between pages."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Same institution, same badge, everywhere (Priority: P1)

A prospective student browses universities. Whether they see an institution on the home page, in the directory, in the majors explorer, in the quick-view modal, on the full detail page, in the comparison view, or in their saved bookmarks, the institution type badge (Public, Private, National, International) is identical in wording and meaning.

**Why this priority**: The type badge is one of the first signals students use to judge cost, admission route and legitimacy. A badge that changes between pages destroys trust in the entire catalog, and is the core of the reported problem.

**Independent Test**: Pick any institution, visit every surface on which it appears in both English and Arabic, and confirm the badge text is the same on each surface for a given language.

**Acceptance Scenarios**:

1. **Given** an institution classified as National, **When** a student views it on each of the home page, directory, majors explorer, quick-view modal, detail page, comparison view and bookmarks, **Then** every surface shows "National" (English) or "أهلية" (Arabic).
2. **Given** an administrator has just changed an institution's type, **When** a student opens any surface after the platform's normal content refresh window, **Then** every surface shows the new type; no surface continues to show the old type.
3. **Given** an institution whose type is unknown, **When** it is shown on any surface, **Then** every surface treats it the same way (see FR-006) rather than some showing "Public" and others "Private".

---

### User Story 2 - Imported data is classified correctly or flagged (Priority: P1)

A data maintainer imports institutions from source files whose type values are free text in English or Arabic (e.g. "International Branch", "Private, Non-profit", "جامعة أهلية", "معهد خاص"). Each record lands in the correct category, and any value that cannot be recognised confidently is reported for review instead of being silently assigned a category.

**Why this priority**: Wrong data at import is the origin of most visible errors; fixing display alone would faithfully show wrong information.

**Independent Test**: Run an import containing a representative set of known and unknown type values and compare the resulting classifications and the review report against an expected table.

**Acceptance Scenarios**:

1. **Given** a source record with type "International Branch", **When** it is imported, **Then** it is classified as International (not National).
2. **Given** source records with "جامعة أهلية", "Private, Non-profit", "Private Institute", "Public Research", "خاصة" and "خاص", **When** they are imported, **Then** they are classified as National, Private, Private, Public, Private and Private respectively.
3. **Given** a source record with an empty or unrecognised type (e.g. "Technological", "N/A"), **When** it is imported, **Then** the record is not assigned a guessed category, and it appears in the import review report with the institution name and the original value.
4. **Given** an import finishes, **When** the maintainer reads the summary, **Then** it states how many records were classified per category and how many need review.

---

### User Story 3 - Type filters behave predictably (Priority: P2)

A student filters the directory by type, either by clicking a type chip or by arriving from a link elsewhere on the site (footer "Public universities", home page "National universities", etc.). The matching chip is visibly selected, the results match, and the filter can be removed with one click.

**Why this priority**: Filters that look off while active, or that cannot be cleared, make the badge look wrong even when the data is right.

**Independent Test**: Follow every site link that pre-applies a type filter, and separately click each chip; verify selected state, results and clearing.

**Acceptance Scenarios**:

1. **Given** a student follows the footer link for Private universities, **When** the directory loads, **Then** the "Private" chip is shown as selected and only Private institutions are listed.
2. **Given** a type filter is active (from a link or a click), **When** the student clicks the selected chip once, **Then** the filter is removed and the full list returns.
3. **Given** the "National" filter is active, **When** results are shown, **Then** no International institution appears in the results (and vice versa).
4. **Given** the catalog contains no institutions of a given type, **When** the student views the type filters, **Then** that type is not offered as a selectable option, and any site link to that type lands on a clear explanatory empty state rather than a silent blank list.
5. **Given** an old or differently-cased link (e.g. "?type=National" or "?type=private"), **When** it is opened, **Then** it behaves exactly like the canonical link for that type.

---

### User Story 4 - Arabic users see Arabic type labels on every page (Priority: P2)

A student using the site in Arabic sees حكومية / خاصة / أهلية / دولية on every surface, including the full university detail page.

**Why this priority**: Arabic is a primary audience; a single English badge in an Arabic page is a visible inconsistency already reported.

**Independent Test**: Switch language to Arabic and check the type badge on every surface listed in User Story 1.

**Acceptance Scenarios**:

1. **Given** the site language is Arabic, **When** the student opens a university detail page, **Then** the type badge is in Arabic.
2. **Given** the student switches language, **When** the page updates, **Then** every type badge and type filter label switches language together.

---

### User Story 5 - Catalog classifications are verified against an agreed rule (Priority: P3)

A content owner reviews the institution types in the catalog against a documented classification rule, corrects records that contradict it (e.g. an institution recorded as Private whose own description identifies it as أهلية), and records the evidence for each correction.

**Why this priority**: Fixes the known factual errors and prevents future disagreement, but depends on a business decision about the classification rule and does not block the technical consistency fixes.

**Independent Test**: Produce the audit list of all institutions with their current type, rule-derived type, and evidence; confirm every mismatch is either corrected or explicitly justified.

**Acceptance Scenarios**:

1. **Given** the documented classification rule, **When** the audit is complete, **Then** every institution in the catalog has a type consistent with that rule and a recorded source (e.g. official ministry listing).
2. **Given** an institution's own bilingual descriptions, **When** they are compared with its recorded type, **Then** they do not contradict each other.

---

### Edge Cases

- A source type value contains both "International" and "National" wording (e.g. "Alamein International University – National (أهلية)"): the classification follows the documented rule for the institution's legal status, not the presence of a word in its name.
- An institution's name includes a type word that differs from its legal type (e.g. a National university named "…International University"): the badge reflects the recorded type, never the name.
- An administrator saves an institution without choosing a type: the save is rejected with a clear message; type is a required field.
- A link contains an unknown type (e.g. "?type=TECHNOLOGICAL"): the directory ignores it, shows all institutions, and does not show a broken or unselectable chip.
- Multiple type filters are selected at once: results include institutions of any selected type, and each selected chip can be cleared independently.
- Language is switched while a type filter is active: the filter stays applied and its label changes language.
- A record in the catalog has a type value outside the four supported categories (legacy data): it is surfaced in the review report and treated as "unknown" on the site, not shown as raw text.

## Requirements *(mandatory)*

### Functional Requirements

**Single definition of institution type**

- **FR-001**: The platform MUST support exactly one set of institution types: Public (حكومية), Private (خاصة), National (أهلية) and International (دولية). No surface may offer, label or count any other type.
- **FR-002**: Each institution type MUST have exactly one English label, one Arabic label and one icon, and every surface (home page, directory cards, directory filters, majors explorer list and filters, quick-view modal, detail page, comparison view, bookmarks/dashboard, admin views, footer links) MUST use those same labels and icon.
- **FR-003**: Type badges and type filter labels MUST be displayed in the viewer's currently selected language on every surface, including the university detail page.

**Classification at import and edit**

- **FR-004**: The import process MUST classify free-text type values (English or Arabic, any letter case, masculine or feminine Arabic forms) into the supported types such that a value naming one type is never classified as another type merely because one type's name is contained within another's (e.g. "International" MUST NOT be read as "National").
- **FR-005**: The import process MUST NOT assign a type by default when a value is empty or unrecognised; such records MUST be listed in an import review report containing the institution identifier, name and original value.
- **FR-006**: An institution with no recognised type MUST be displayed identically on all surfaces: no type badge is shown, and it is excluded from type-specific filter results while remaining visible under "All".
- **FR-007**: The administrator editing experience MUST require a type to be selected from the supported types before an institution can be saved or published.
- **FR-008**: Each import MUST produce a summary with counts per type and a count of records requiring review.

**Filtering and links**

- **FR-009**: Every site link that pre-applies a type filter MUST use one canonical form per type, and the directory MUST also accept any letter-case variant of the type name as equivalent.
- **FR-010**: When a type filter is applied by any means, the corresponding filter option MUST appear selected, and a single action on it MUST remove that filter.
- **FR-011**: Type filters MUST match institutions by exact type; selecting one type MUST NOT return institutions of a different type.
- **FR-012**: Type filter options MUST only be offered for types that currently have at least one published institution, and MUST show the count of institutions for each type.
- **FR-013**: When a link targets a type with no institutions, the directory MUST show an explanatory empty state (in the current language) with a one-click way to view all institutions.
- **FR-014**: Unknown type values in links MUST be ignored without error.

**Freshness**

- **FR-015**: All surfaces MUST present institution types from the same current catalog; after an administrator changes an institution's type, no surface may continue to show the previous type beyond the platform's standard content refresh window (currently up to 1 hour).

**Data correctness**

- **FR-016**: The team MUST document the rule that determines an institution's type, including how to classify institutions that are non-profit, established by intergovernmental agreement, or branch campuses of foreign universities. Classification rule: an institution's type MUST follow its official Egyptian Ministry of Higher Education category exactly — حكومية → Public, خاصة → Private, أهلية → National. International is used only for branch campuses of foreign universities. Non-profit and intergovernmental-agreement institutions take whatever category the Ministry lists them under; being non-profit or intergovernmental does not by itself make an institution National or International.
- **FR-017**: Every institution in the catalog MUST be audited against the rule in FR-016, and each record's type MUST be backed by a recorded source reference.
- **FR-018**: An institution's type MUST NOT contradict its own English or Arabic description; the audit MUST flag and resolve such contradictions (known case: Nile University recorded as Private while its Arabic description calls it أهلية; intergovernmental institutions E-JUST and the French University in Egypt are currently classified differently from each other).

### Key Entities

- **Institution Type**: The legal/administrative category of a higher-education institution. Attributes: canonical identifier, English label, Arabic label, icon, definition (from the classification rule). Fixed set of four values.
- **Institution**: A university or institute in the catalog. Relevant attributes: type (required, one Institution Type), type source reference (evidence for the classification), bilingual descriptions.
- **Import Review Entry**: A record that could not be classified during import. Attributes: institution identifier, institution name, original type value, import run, resolution status.
- **Classification Rule**: The documented policy mapping an institution's legal status to an Institution Type: the official Ministry of Higher Education category decides the type; International is reserved for foreign branch campuses.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: For 100% of published institutions, the type badge text is identical across all surfaces listed in FR-002 for a given language (verified by an automated cross-surface check over the full catalog in English and Arabic).
- **SC-002**: 0 institutions in the catalog carry a type that was assigned by default rather than from source data or an administrator's explicit choice.
- **SC-003**: 100% of a reference set of at least 20 real-world English and Arabic type values (including "International Branch", "Private, Non-profit", "جامعة أهلية", "معهد خاص") are classified as expected or routed to review; 0 are silently misclassified.
- **SC-004**: 100% of site links that pre-apply a type filter open with the matching filter visibly selected and clearable in one click.
- **SC-005**: 0 type filter options lead to an unexplained empty result list.
- **SC-006**: 0 English type labels appear on any page while the site language is Arabic, and vice versa.
- **SC-007**: After an administrator changes an institution's type, all surfaces reflect the change within the standard refresh window (≤ 1 hour) in 100% of tested cases.
- **SC-008**: 100% of catalog institutions have an audited type with a recorded source, and 0 have a type that contradicts their own descriptions.
- **SC-009**: User-reported issues about wrong or inconsistent institution type drop to zero in the 30 days following release.

## Assumptions

- The four supported types are Public, Private, National and International, matching the existing data model; "Technological" is not a catalog type and will be removed from every surface where it appears. Technological universities, if added later, would be a separate feature.
- For institutions whose type is unknown, hiding the badge (rather than showing an "Unclassified" label) is the preferred user-facing behaviour, since showing a label that is not a real category would itself be misleading.
- Hiding filter options for types with zero institutions is preferred over showing disabled options, consistent with how the majors explorer already hides empty types.
- The standard content refresh window remains up to 1 hour; making changes appear instantly is out of scope.
- Existing links in the wild (bookmarks, shared URLs, search engine results) using any casing of a type must keep working.
- The catalog audit (User Story 5) is performed by a content owner with access to official ministry listings; engineering provides the audit list and applies corrections.
- Out of scope: redesigning the badge visual style, adding new institution types, and changing tuition estimates that are derived from type (though they will automatically benefit from corrected types).
