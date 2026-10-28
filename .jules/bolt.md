## 2024-05-30 - Granular Zustand Selectors
**Learning:** Using granular selectors (e.g. `useStore(state => state.items.some(i => i.id === id))`) in lists, instead of destructuring the whole state object, limits re-renders of the components significantly.
**Action:** Prioritize selecting primitive values or boolean conditions using selectors for any globally stored arrays displayed as lists.
