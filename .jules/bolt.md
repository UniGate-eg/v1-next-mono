## 2026-09-19 - Memoize invariant computations inside loops
**Learning:** In React components rendering large tables/lists (like `UniversityDataTable`), inline operations inside `.filter()` or `.map()` (like `search.toLowerCase()` or computing a stale date threshold) are executed O(n) times per re-render. If the component re-renders frequently (e.g. checkbox selections), this creates significant CPU overhead.
**Action:** Use `useMemo` and hoist invariant calculations out of the filtering/mapping loops to compute them once per relevant state change instead of per item.
