## 2024-05-27 - [Zustand Destructuring Performance Penalty]
**Learning:** Destructuring a Zustand store (e.g., `const { data } = useStore()`) in a component rendered within a list subscribes every item to the entire store, causing severe O(N) re-render penalties whenever any property changes.
**Action:** Always use granular selectors returning primitive values (e.g., `useStore(state => state.items.some(i => i.id === id))`) in list components and hoist derived variables above early returns using optional chaining.
