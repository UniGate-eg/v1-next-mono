## 2026-10-25 - ARIA Labels for Icon-Only Buttons
**Learning:** Found multiple instances of icon-only action buttons (e.g., Edit, Delete, Revoke) in standard list components that relied entirely on `title` attributes for tooltips, which aren't fully read by screen readers.
**Action:** Always ensure that icon-only buttons (`<button size="icon">` or custom classes without text nodes) include explicit `aria-label` attributes to maintain WCAG accessibility, especially in complex interactive interfaces like admin panels or dashboards.
