## 2024-05-18 - Missing ARIA labels on Icon-only buttons
**Learning:** Found a pattern of icon-only buttons (like Trash/delete or X/clear buttons) in `BookmarkCard.tsx` and `UniversitySearch.tsx` relying exclusively on `title` attributes for tooltips, but lacking `aria-label`s which are essential for screen reader users when there's no visible text inside the button.
**Action:** Always verify that icon-only buttons have an explicitly defined `aria-label` attribute describing their action, even if a `title` attribute is already present.
