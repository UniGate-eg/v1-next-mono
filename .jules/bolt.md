## 2026-09-18 - Prevent Input Jank in Large Client-side Lists
**Learning:** Client-side filtering of hundreds of items across multiple fields on every keystroke blocks the main thread, causing significant input jank.
**Action:** Use React's `useDeferredValue` for the search query to deprioritize the heavy list filtering calculation relative to updating the input UI.
