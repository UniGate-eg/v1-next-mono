## 2025-02-23 - Granular Zustand Selectors
**Learning:** Destructuring Zustand stores in list components (e.g., `const { data } = useStore()`) subscribes every item to the entire store, causing O(N) re-renders when any unrelated item updates.
**Action:** Always use granular selectors returning primitive values (e.g., `useStore(state => state.items.some(i => i.id === id))`) in list items so they only re-render when their specific state changes, and ensure hooks remain at the top level above conditional early returns to respect the Rules of Hooks.
