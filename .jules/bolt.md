## 2024-05-18 - Optimized Zustand Store Destructuring
**Learning:** Components destructuring the entire `useCompareStore` and `useBookmarks` hooks re-render whenever *any* part of the store changes.
**Action:** Use granular selectors for Zustand store properties (e.g., `useCompareStore(state => state.selectedUniversities.some(u => String(u.id) === uniIdStr))`) instead of pulling all state and deriving locally to prevent unnecessary renders in list components.
