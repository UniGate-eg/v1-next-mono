## 2026-09-15 - Added ARIA labels for icon-only buttons
**Learning:** Found that some delete/clear/remove icon-only buttons were missing `aria-label` attributes, affecting screen reader accessibility. Conditionally resolving text according to bilingual (EN/AR) implementation logic works well for ARIA labels.
**Action:** Always verify icon-only interactive elements possess an accessible label (e.g. `aria-label`) corresponding to the current language.
