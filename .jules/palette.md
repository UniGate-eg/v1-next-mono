## 2024-05-19 - Missing ARIA Labels on Icon-only Buttons
**Learning:** Found multiple instances of icon-only buttons lacking `aria-label`s, which is critical for screen reader accessibility. Although some have `title` attributes, `aria-label` provides a more robust and accessible experience.
**Action:** Always ensure that icon-only buttons have an appropriate `aria-label` to describe their function to assistive technologies, replacing or complementing `title` attributes.
