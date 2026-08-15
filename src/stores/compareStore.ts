import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

export interface CompareUniversityItem {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  type: string;
  governorate: string;
  majorsCount?: number;
  emoji?: string;
  shortName?: string;
}

interface CompareState {
  selectedIds: string[];
  selectedUniversities: CompareUniversityItem[];
  isOpen: boolean;
  toggleUniversity: (item: CompareUniversityItem) => void;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  setIsOpen: (open: boolean) => void;
}

export const useCompareStore = create<CompareState>()(
  devtools(
    persist(
      (set, get) => ({
        selectedIds: [],
        selectedUniversities: [],
        isOpen: false,
        toggleUniversity: (item: CompareUniversityItem) => {
          const currentUnis = get().selectedUniversities;
          const exists = currentUnis.some((u) => u.id === item.id);

          if (exists) {
            const nextUnis = currentUnis.filter((u) => u.id !== item.id);
            set({
              selectedUniversities: nextUnis,
              selectedIds: nextUnis.map((u) => u.id),
            });
          } else {
            let nextUnis = [...currentUnis, item];
            if (nextUnis.length > 3) {
              nextUnis = nextUnis.slice(nextUnis.length - 3);
            }
            set({
              selectedUniversities: nextUnis,
              selectedIds: nextUnis.map((u) => u.id),
              isOpen: true,
            });
          }
        },
        toggle: (id: string) => {
          const current = get().selectedIds;
          if (current.includes(id)) {
            const nextIds = current.filter((item) => item !== id);
            const nextUnis = get().selectedUniversities.filter((u) => u.id !== id);
            set({ selectedIds: nextIds, selectedUniversities: nextUnis });
          } else {
            let nextIds = [...current, id];
            if (nextIds.length > 3) {
              nextIds = nextIds.slice(nextIds.length - 3);
            }
            set({ selectedIds: nextIds, isOpen: true });
          }
        },
        remove: (id: string) => {
          set((state) => ({
            selectedIds: state.selectedIds.filter((item) => item !== id),
            selectedUniversities: state.selectedUniversities.filter((u) => u.id !== id),
          }));
        },
        clear: () => set({ selectedIds: [], selectedUniversities: [] }),
        setIsOpen: (open: boolean) => set({ isOpen: open }),
      }),
      {
        name: "unicompass-compare-storage",
      }
    )
  )
);
