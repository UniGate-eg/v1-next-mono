## 2024-05-24 - Granular Zustand Selectors
**Learning:** Destructuring the entire Zustand store (e.g., `const { selectedUniversities } = useCompareStore()`) causes the component to re-render whenever *any* state in the store changes. In lists (like university cards), this means every card re-renders when a single card is toggled.
**Action:** Use granular selectors (e.g., `useCompareStore(state => state.selectedIds.includes(id))`) to subscribe only to specific slices of state.
