## 2024-10-16 - Add ARIA Labels to Admin Notification Bell
**Learning:** Found multiple icon-only buttons in `src/components/admin/NotificationBell.tsx` that lack standard `aria-label`s despite having `title` attributes. Tooltips/titles don't always reliably announce to screen readers.
**Action:** Ensure all icon-only action buttons (like bell toggles or mark read checks) always include an `aria-label` for better screen reader accessibility.
