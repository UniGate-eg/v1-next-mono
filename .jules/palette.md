## 2026-10-01 - Add ARIA Labels and Invalid States to RegisterForm

**Learning:** When using conditional string rendering (like checking `errors.field`), inputs don't inherently communicate invalid states to screen readers. Relying only on rendering `<p>` tags for error messages without connecting them using `aria-invalid` and `aria-describedby` results in a poor accessibility experience. Toggle buttons that update visually but lack ARIA attributes also fail to describe their purpose or current state.

**Action:** When creating forms, always link validation error messages to their respective inputs using `aria-describedby` matching the `id` of the error paragraph. The error paragraph should contain `role="alert"`. Furthermore, ensure inputs dynamically reflect validation state using `aria-invalid`. Provide context on buttons without text using `aria-label` and `aria-pressed`.
