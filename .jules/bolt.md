## 2024-05-15 - Granular Zustand selectors in lists
**Learning:** Using full Zustand store destructuring (e.g., `const { data } = useStore()`) in list components like `UniversityCard` causes massive O(N) re-renders across the entire list whenever any property in the store changes, because every item subscribes to the whole store.
**Action:** Always use granular selectors that return primitive values (e.g., `useStore(state => state.items.some(i => i.id === id))`) in list components, ensuring the hook is placed above any conditional early returns to obey React's Rules of Hooks.
