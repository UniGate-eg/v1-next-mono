## 2026-11-03 - Zustand Destructuring in Lists
**Learning:** Destructuring the entire Zustand store (e.g. `const { data } = useStore()`) inside list components causes every item in the list to re-render whenever the store changes, resulting in O(N) performance penalties.
**Action:** Always use granular selectors that return primitive values or stable references (e.g. `useStore(state => state.items.some(i => i.id === id))`) when accessing Zustand state in list elements to ensure components only re-render when their specific state changes.
