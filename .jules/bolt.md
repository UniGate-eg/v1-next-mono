## 2023-10-25 - [O(n^2) nested string processing bottleneck]
**Learning:** The `MajorMatchEngine` executed redundant array lowercasing and corpus generation for every major/university pairing, causing significant CPU time (2-5s per 100 runs) during sorting/scoring loops.
**Action:** Use `WeakMap` based caches to memoize `extractTokens().join(" ")` operations, `calculatePrestigeScore`, and `Array.prototype.map(tolowerCase)` operations during heavy $N \times M$ computations, resulting in 2.5x speed improvements. Avoid generating new string buffers repetitively inside tight loops.
