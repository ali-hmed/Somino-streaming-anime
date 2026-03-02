import { create } from "zustand";

interface TopTenState {
    topTen: any;
    setTopTen: (action: any) => void;
}

const useTopTenStore = create<TopTenState>((set) => ({
    topTen: {},
    setTopTen: (action) => set({ topTen: action }),
}));

export default useTopTenStore;
