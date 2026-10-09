## 2024-05-24 - Missing ARIA Labels on Icon-only Buttons
**Learning:** Found an icon-only button inside UniversitySearch component that acts as a "clear search" action but is not properly labeled for screen readers, meaning users would only hear "button" rather than what the button does.
**Action:** Always verify that buttons containing only icons (like `lucide-react` icons) have `aria-label` or `title` attributes explaining their function.
