## 2025-03-01 - Zustand State Granularity
**Learning:** Destructuring whole Zustand store variables (like `const { selectedUniversities } = useCompareStore()`) causes every list item consuming that state to re-render whenever the store changes, even for irrelevant modifications.
**Action:** Use granular selectors that evaluate to a boolean or primitive value (e.g. `useCompareStore(state => state.selectedUniversities.some(u => u.id === id))`) to restrict re-renders strictly to affected components.
