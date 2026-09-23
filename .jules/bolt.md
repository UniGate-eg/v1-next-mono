## 2026-09-23 - Client-side Filtering Performance

**Learning:** When dealing with hundreds of items in client-side directories (like `UniversitiesDirectoryClient.tsx`), running a complex `useMemo` filter block on every keystroke blocks the main thread, causing noticeable input lag. The `searchQuery` state needs to be decoupled from the filter execution.

**Action:** Created and applied a custom `useDebounce` hook to the search input state before passing it to expensive filtering mechanisms. This pattern should be consistently applied to other large data tables and directories across the app.
