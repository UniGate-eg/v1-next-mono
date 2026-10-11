## 2024-03-24 - Zustand Selector Performance in List Components
**Learning:** Destructuring a Zustand store without a selector (e.g., `const { data } = useStore()`) inside a list item component subscribes every rendered item to the entire store. This causes all components in the list to re-render whenever *any* unrelated state changes in the store.
**Action:** Always use granular selectors that return primitive values (e.g., `useStore(state => state.items.some(i => i.id === id))`) in list components so they only re-render when their specific state changes.
