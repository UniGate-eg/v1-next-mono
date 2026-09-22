## 2024-05-24 - Missed ARIA Labels on Icon-Only Buttons
**Learning:** Icon-only buttons with tooltips (`title` attribute) in this application sometimes lack the corresponding `aria-label` necessary for screen readers, meaning accessibility doesn't match visual intent.
**Action:** When auditing new custom modal controls or action matrices, explicitly check for and add `aria-label` alongside visual or tooltip descriptions.
