import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Theme } from "@/config/theme";

type ThemeStore = {
  preference: Theme;
  setPreference: (theme: Theme) => void;
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      preference: "system",
      setPreference: (theme) => set({ preference: theme }),
    }),
    { name: "theme-preference" },
  ),
);
