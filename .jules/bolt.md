## 2023-10-25 - Zustand Selective Subscription
**Learning:** Using `useStore()` without selectors or destructuring from `useStore()` causes the component to subscribe to all state changes in the store. This can lead to unnecessary re-renders in list components when only one item's state changes.
**Action:** Always use granular selectors with Zustand stores (e.g. `useStore(state => state.items.some(i => i.id === id))`) in list item components to prevent O(N) re-renders when a single item changes.
