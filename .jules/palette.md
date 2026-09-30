## 2023-10-27 - Icon-only buttons accessibility in Admin Dashboard
**Learning:** Found multiple instances of icon-only buttons (like the Notification Bell and "Mark Read" buttons) in the Admin portal using `title` attributes but missing `aria-label`. While `title` provides visual tooltips on hover, it is inconsistently supported by screen readers and does not guarantee an accessible name.
**Action:** Ensure all icon-only interactive elements receive an explicit `aria-label`, especially in dense administrative interfaces where actions are condensed into small icons.
