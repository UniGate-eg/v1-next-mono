## 2026-10-28 - Missing ARIA Labels on Icon-Only Buttons in Admin Panel
**Learning:** Several internal admin components (like the `NotificationBell`, `UniversityDataTable`, and `RollbackDialog`) had interactive icon-only buttons (like select checkboxes or close buttons) without proper `aria-label` attributes.
**Action:** Always ensure that any button without visible text content includes an explicitly set `aria-label` for screen reader accessibility, particularly in administrative tools where these actions are frequent and impactful.
