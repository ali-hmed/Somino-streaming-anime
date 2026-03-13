import { create } from 'zustand';

interface PopupState {
    activeId: string | null;
    setActiveId: (id: string | null) => void;
}

export const usePopupStore = create<PopupState>((set) => ({
    activeId: null,
    setActiveId: (id) => set({ activeId: id }),
}));
