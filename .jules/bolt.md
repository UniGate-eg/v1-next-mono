## 2024-10-06 - React.memo with dynamic inline objects
**Learning:** In UniversitiesDirectoryClient, even if we memoized `UniversityCard` and `onViewDetails`, passing a dynamic inline object like `style={{ animationDelay: ... }}` negates the `React.memo` optimization entirely, as the inline object fails the shallow equality check.
**Action:** Extract dynamically generated styles into a `useMemo` hook in the parent component and pass the referenced stable object to the child component.
