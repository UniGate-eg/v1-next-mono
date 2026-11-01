1. **Refactor `UniversityCard.tsx`**
   - Apply a merge diff to hoist `uniIdStr` and use granular selectors for Zustand store:
     ```
     <<<<<<< SEARCH
       const { language } = useLanguage();
       const { bookmarks, createBookmark, deleteBookmark } = useBookmarks();
       const { selectedUniversities, toggleUniversity } = useCompareStore();

       if (!university) return null;

       const uniIdStr = String(university.id || (university as any).slug || "");
       const isCompared = selectedUniversities.some((u) => String(u.id) === uniIdStr);
     =======
       const { language } = useLanguage();
       const { bookmarks, createBookmark, deleteBookmark } = useBookmarks();

       const uniIdStr = String(university?.id || (university as any)?.slug || "");
       const isCompared = useCompareStore((state) => state.selectedUniversities.some((u) => String(u.id) === uniIdStr));
       const toggleUniversity = useCompareStore((state) => state.toggleUniversity);

       if (!university) return null;
     >>>>>>> REPLACE
     ```

2. **Refactor `UniversityModal.tsx`**
   - Apply a merge diff to hoist `uniIdStr` and use granular selectors for Zustand store:
     ```
     <<<<<<< SEARCH
       const { language } = useLanguage();
       const isArabic = language === "ar";

       const { selectedUniversities, toggleUniversity } = useCompareStore();
       const { bookmarks, createBookmark, deleteBookmark } = useBookmarks();

       const [expandedFaculties, setExpandedFaculties] = useState<Record<number, boolean>>({ 0: true });
     =======
       const { language } = useLanguage();
       const isArabic = language === "ar";

       const uniIdStr = String(uni?.id || "");
       const isCompared = useCompareStore((state) => state.selectedUniversities.some((u) => String(u.id) === uniIdStr));
       const toggleUniversity = useCompareStore((state) => state.toggleUniversity);
       const { bookmarks, createBookmark, deleteBookmark } = useBookmarks();

       const [expandedFaculties, setExpandedFaculties] = useState<Record<number, boolean>>({ 0: true });
     >>>>>>> REPLACE
     ```
     ```
     <<<<<<< SEARCH
       const uniIdStr = String(uni?.id || "");
       const isCompared = selectedUniversities.some((u) => String(u.id) === uniIdStr);
       const existingBookmark = bookmarks.find(
     =======
       const existingBookmark = bookmarks.find(
     >>>>>>> REPLACE
     ```

3. **Verify functionality and performance**
   - Run the test suite using `SKIP_ENV_VALIDATION=1 pnpm test`, verify types with `pnpm type-check`, and test the build with `SKIP_ENV_VALIDATION=1 pnpm build` to ensure the fix is correct and introduces no regressions.

4. Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.
