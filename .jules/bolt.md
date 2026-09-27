
## 2024-05-18 - Deferred Search Query for Search Input
**Learning:** React state updates on every keystroke for filtering a large dataset can cause significant input lag, making the UI feel unresponsive.
**Action:** Use `useDeferredValue` on the search query state used for filtering. This allows the search input to remain highly responsive as the heavy filtering computation happens in the background with the deferred value.
