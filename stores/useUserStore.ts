import { create } from "zustand";

export interface UserProfileState {
  id: string | null;
  email: string | null;
  fullName: string;
  role: "student" | "teacher" | "admin";
  phone: string | null;
  avatarUrl: string | null;
  academicLevel: string | null;
  isOnboarded: boolean;

  // Actions
  setUser: (user: Partial<UserProfileState>) => void;
  clearUser: () => void;
}

const initialState = {
  id: null,
  email: null,
  fullName: "",
  role: "student" as const,
  phone: null,
  avatarUrl: null,
  academicLevel: null,
  isOnboarded: false,
};

/**
 * Global User & Session Store
 * 
 * Provides instant access to the logged-in user profile across all components
 * without prop drilling or unnecessary network re-fetches.
 */
export const useUserStore = create<UserProfileState>((set) => ({
  ...initialState,

  setUser: (data) =>
    set((state) => ({
      ...state,
      ...data,
    })),

  clearUser: () => set(initialState),
}));
