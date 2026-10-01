## 2023-10-27 - React.memo on UniversityCard
**Learning:** `UniversityCard` components are rendered in massive lists on the universities directory and marketing home pages. They receive inline function callbacks (like `onViewDetails={() => ...}`), which breaks `React.memo` by changing the prop reference on every parent render.
**Action:** When applying `React.memo` to components mapped in long lists, ensure all callback props from the parent are wrapped in `useCallback` to preserve reference equality and actually prevent re-renders.
