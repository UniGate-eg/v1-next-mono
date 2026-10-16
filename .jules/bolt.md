## 2024-05-15 - Granular Zustand Selectors in List Components
**Learning:** Destructuring a Zustand store in a list component (e.g., `const { data } = useStore()`) subscribes every item to the entire store, causing O(N) re-renders when any state changes.
**Action:** Always use granular selectors returning primitive values (e.g., `useStore(state => state.items.some(i => i.id === id))`) in list components so items only re-render when their specific state changes.
