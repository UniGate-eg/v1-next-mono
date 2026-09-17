## 2024-05-18 - Deferring Heavy Search Filtering in UniversitiesDirectoryClient
**Learning:** The main thread gets blocked when heavy synchronous filtering is bound directly to an input state that updates on every keystroke, causing sluggish UI behavior.
**Action:** Use `React.useDeferredValue()` for expensive computations triggered by keystrokes, decoupling the immediate input state from the deferred processing state.
