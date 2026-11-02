## 2024-11-02 - Icon-only buttons missing ARIA labels
**Learning:** Icon-only buttons used as edit triggers in the admin lists (e.g., ProgramModal, FacultyModal) were missing `aria-label` attributes, which creates an accessibility barrier for screen reader users trying to navigate the admin tables.
**Action:** Always ensure that `<Button size="icon">` or any button containing only an icon receives an explicit `aria-label` attribute describing its function (e.g., "Edit program").
