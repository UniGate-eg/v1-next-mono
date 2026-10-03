## 2024-10-03 - Missing ARIA labels on Icon-only buttons
**Learning:** Found several components using Lucide icons inside `<button>` elements without text content or `aria-label` attributes. This pattern is inaccessible for screen readers.
**Action:** Ensure all icon-only buttons include an `aria-label` attribute describing their action, such as `aria-label="Clear search"`.
