## 2024-10-24 - Avoid O(N) Invariants in React Filters
**Learning:** Performing invariant string operations (like `search.toLowerCase()`) or object instantiations (like `new Date()`) inside `Array.prototype.filter` operations inside React render passes (or `useMemo` hooks) causes severe O(N) performance penalties on large lists.
**Action:** Always hoist invariant object allocations and formatting methods outside of any loop structures, especially when filtering tables and lists.
