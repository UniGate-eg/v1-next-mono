## 2024-06-19 - Zustand Store Destructuring Anti-pattern
**Learning:** Destructuring entire Zustand stores (e.g., `const { selectedUniversities } = useCompareStore()`) inside list components (like `UniversityCard`) causes every single card to re-render whenever the store changes, resulting in an O(N) rendering penalty.
**Action:** Always use granular selectors that return primitive values (e.g., `useCompareStore(state => state.selectedUniversities.some(u => u.id === id))`) in list components so they only subscribe to their own specific slice of state.
