## 2024-05-24 - Zustand Store Re-renders in Lists
**Learning:** Destructuring a Zustand store (e.g. `const { selectedUniversities } = useStore()`) in a list item component subscribes every list item to the entire store. If any item is selected, the whole store updates, causing O(N) re-renders across all items in the list.
**Action:** Use granular selectors that return primitive boolean values (e.g., `useStore(state => state.items.some(i => i.id === id))`) so that items only re-render when their specific selection state changes.
