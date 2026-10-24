## 2026-10-24 - Avoid destructuring entire Zustand stores in lists
**Learning:** Destructuring entire Zustand stores (e.g. `const { data } = useStore()` in `useCompareStore`) causes components to re-render whenever *any* part of the store changes. In lists like UniversityCard, this causes O(N) re-renders for all items instead of just the modified item.
**Action:** Always use granular selectors (e.g. `useStore(state => state.specificItem === id)`) to ensure components only re-render when their specific state changes.
