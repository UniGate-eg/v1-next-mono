## 2025-02-20 - Refactored Zustand store destructuring to specific selectors in lists

**Learning:** When using Zustand stores (e.g., `useCompareStore`) in list components such as `UniversityCard`, destructuring the whole store (e.g., `const { selectedUniversities } = useCompareStore()`) causes every list item component to re-render when ANY item is added or removed.

**Action:** Use granular selectors that return primitive values (e.g., `useCompareStore(state => state.selectedUniversities.some(i => i.id === id))`) so list items only re-render when their specific state changes, significantly improving list rendering performance.
