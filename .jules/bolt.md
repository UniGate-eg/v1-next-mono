## 2024-10-31 - Zustand Granular Selectors
**Learning:** Destructuring a Zustand store in a list component (e.g., `const { data } = useStore()`) subscribes every item to the entire store, causing massive O(N) re-renders when any part of the store changes.
**Action:** Use granular selectors that return primitive values (e.g., `useStore(state => state.items.some(i => i.id === id))`) so items only re-render when their specific state changes.
