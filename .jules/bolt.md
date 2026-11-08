## 2024-05-24 - Optimize Zustand CompareStore Usage
**Learning:** Destructuring the entire `useCompareStore` in list components like `UniversityCard` (e.g., `const { selectedUniversities, toggleUniversity } = useCompareStore()`) forces all instances of the component to re-render whenever *any* item is added or removed from the store, leading to O(N) re-renders in large lists.
**Action:** Use granular selectors for both state derived values (e.g., checking if the specific item is selected) and functions, ensuring components only re-render when their specific derived state changes.
