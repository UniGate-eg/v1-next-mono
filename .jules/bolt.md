## 2025-02-27 - Zustand granular selectors

**Learning:** In list components, destructuring the whole Zustand store (e.g., `const { data } = useStore()`) subscribes every list item to the entire store, causing severe performance penalties and unnecessary O(N) re-renders when unrelated properties change.

**Action:** Always use granular selectors returning primitive values (e.g., `useStore(state => state.items.some(i => i.id === id))`) so items only re-render when their specific state changes. Ensure early returns do not violate React's Rules of Hooks by evaluating safely above the hooks.
