import { create } from "zustand";

type ModalEntry = {
  id: string;
  payload?: unknown;
};

type ModalStore = {
  stack: ModalEntry[];
  open: (id: string, payload?: unknown) => void;
  close: (id?: string) => void;
};

export const useModalStore = create<ModalStore>((set, get) => ({
  stack: [],
  open: (id, payload) => set({ stack: [...get().stack, { id, payload }] }),
  close: (id) =>
    set({
      stack: id ? get().stack.filter((m) => m.id !== id) : get().stack.slice(0, -1),
    }),
}));
