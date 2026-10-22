## 2024-05-24 - Avoid destructuring Zustand stores in list components
**Learning:** Destructuring the whole Zustand store (e.g., `const { data } = useStore()`) in a component rendered multiple times (like list items) subscribes every instance to the entire store, causing severe O(N) re-renders when any unrelated state in the store updates.
**Action:** Always use granular selectors (e.g., `useStore(state => state.specificData)`) that return primitive values in list components so items only re-render when their specific state changes.
