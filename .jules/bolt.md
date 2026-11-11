## 2024-05-30 - Prevent full re-renders in Zustand stores

**Learning:** Destructuring the entire Zustand store (e.g., `const { selectedUniversities, toggleUniversity } = useCompareStore()`) causes every component using the store to re-render whenever *any* part of the state changes. In list components like `UniversityCard`, this means all items re-render when just one item is added to comparison, leading to O(N) re-render penalties.
**Action:** Always use granular selectors when consuming Zustand stores in lists (e.g., `const isCompared = useCompareStore(state => state.selectedUniversities.some(u => u.id === id))`). Extract methods in separate selectors as well (`const toggleUniversity = useCompareStore(state => state.toggleUniversity)`).
