## 2024-11-20 - Memoization of Lowercased Search Query in useMemo
**Learning:** In a highly interactive filtering component handling large lists (e.g., `UniversitiesDirectoryClient`), repeating the operation `toLowerCase()` on search fields inside an O(N) array `.filter` loop causes a significant performance hit on every keystroke.
**Action:** Always pre-compute and store lowercased strings at the data source, or pull invariant object allocations out of loops.
