import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

interface CompareState {
  selectedIds: string[];
  isOpen: boolean;
  toggle: (id: string) => void;
  add: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  setIsOpen: (open: boolean) => void;
}

export const useCompareStore = create<CompareState>()(
  devtools(
    persist(
      (set, get) => ({
        selectedIds: [],
        isOpen: false,
        toggle: (id: string) => {
          const current = get().selectedIds;
          if (current.includes(id)) {
            set({ selectedIds: current.filter((item) => item !== id) });
          } else {
            if (current.length >= 3) {
              // FIFO queue replacement (drops oldest selected)
              set({ selectedIds: [...current.slice(1), id], isOpen: true });
            } else {
              set({ selectedIds: [...current, id], isOpen: true });
            }
          }
        },
        add: (id: string) => {
          const current = get().selectedIds;
          if (!current.includes(id)) {
            if (current.length >= 3) {
              set({ selectedIds: [...current.slice(1), id], isOpen: true });
            } else {
              set({ selectedIds: [...current, id], isOpen: true });
            }
          }
        },
        remove: (id: string) => {
          set((state) => ({
            selectedIds: state.selectedIds.filter((item) => item !== id),
          }));
        },
        clear: () => set({ selectedIds: [] }),
        setIsOpen: (open: boolean) => set({ isOpen: open }),
      }),
      {
        name: "unicompass-compare-storage",
      }
    )
  )
);
