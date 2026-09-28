## 2024-05-24 - Initial Entry\n**Learning:** Started tracking UX/a11y insights.\n**Action:** Keep documenting critical learnings.

## 2024-06-25 - Search Input Accessibility and Async Feedback
**Learning:** Found that custom search input fields often lack basic ARIA labels and clear buttons lack focus states, impeding screen reader and keyboard user experiences. Additionally, Next.js `useTransition` actions for routing can feel unresponsive without explicit visual indicators (like spinners).
**Action:** Always add `aria-label` to input fields, ensure clear buttons have visible focus outlines, and incorporate loading indicators (e.g., spinners) for async transitions that may take noticeable time.
