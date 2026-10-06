## 2024-10-06 - Missing ARIA Labels on Icon-Only Buttons
**Learning:** Found a recurring pattern in the design system where developers rely solely on `title` attributes for tooltips on icon-only buttons (e.g., clear search, reset filters, delete bookmarks), completely omitting the required `aria-label` attribute. This makes the UI inaccessible to screen reader users who may not receive the tooltip text context properly.
**Action:** Always ensure that icon-only interactive elements receive an explicit `aria-label` even if a `title` attribute is present.
