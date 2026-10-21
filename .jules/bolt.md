## 2024-03-24 - Granular Zustand Selectors in List Components
**Learning:** Destructuring a full Zustand store (e.g., `const { selectedUniversities } = useCompareStore()`) inside list item components like `UniversityCard` causes every single card to re-render whenever *any* item is added to or removed from the store, leading to O(N) re-renders.
**Action:** Always use granular selectors returning primitives (e.g., `useCompareStore(state => state.selectedUniversities.some(u => u.id === id))`) in list components so items only re-render when their specific state changes.
