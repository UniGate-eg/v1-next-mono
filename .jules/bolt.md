## 2025-02-23 - Prevent O(N) Re-renders in Zustand List Items
**Learning:** Destructuring entire Zustand stores in list items (e.g., `const { data } = useStore()\`) subscribes every item to the entire store, causing them all to re-render when ANY state changes.
**Action:** Use granular selectors that return primitive values (e.g., `useStore(state => state.items.some(i => i.id === id))\`) in list components so items only re-render when their specific state changes.
