## 2024-11-02 - Granular Zustand Selectors
**Learning:** Destructuring a Zustand store (e.g., `const { selectedUniversities } = useStore()`) subscribes the component to the entire store, causing unnecessary re-renders when any unrelated property changes.
**Action:** Always use granular selectors that return primitive values or directly compute the required boolean (e.g., `useStore(state => state.items.some(i => i.id === id))`) so components only re-render when their specific derived state changes.
