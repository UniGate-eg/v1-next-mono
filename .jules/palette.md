## 2026-11-07 - Add ARIA labels to icon-only admin action buttons
**Learning:** Icon-only action buttons (like Edit, Delete, Archive) in the admin data tables rely heavily on visual cues. Since they are used in high-volume repeating rows, screen reader users might not know *which* specific entity the button modifies.
**Action:** Always append the name of the entity being modified to the ARIA label of icon-only action buttons in repeated table rows (e.g. `aria-label="Edit program"` or better `aria-label={\`Edit \${program.name}\`}` where possible).
