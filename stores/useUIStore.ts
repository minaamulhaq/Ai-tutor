import { create } from "zustand";

interface UIState {
  isMobileNavOpen: boolean;
  isSearchModalOpen: boolean;
  activeNotificationsCount: number;

  // Actions
  toggleMobileNav: () => void;
  setMobileNav: (open: boolean) => void;
  setSearchModal: (open: boolean) => void;
  setNotificationsCount: (count: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileNavOpen: false,
  isSearchModalOpen: false,
  activeNotificationsCount: 0,

  toggleMobileNav: () => set((state) => ({ isMobileNavOpen: !state.isMobileNavOpen })),
  setMobileNav: (open) => set({ isMobileNavOpen: open }),
  setSearchModal: (open) => set({ isSearchModalOpen: open }),
  setNotificationsCount: (count) => set({ activeNotificationsCount: count }),
}));
