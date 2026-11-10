## 2024-11-10 - Zustand Selector Optimization in Lists
**Learning:** Destructuring the entire Zustand store (e.g., `const { data } = useStore()`) in a list component subscribes every list item to the entire store, causing O(N) re-renders when any part of the store changes.
**Action:** Use granular selectors that return primitive values (e.g., `useStore(state => state.items.some(i => i.id === id))`) so items only re-render when their specific state changes.
