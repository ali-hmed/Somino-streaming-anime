import { create } from "zustand";

interface GenresState {
    genres: string[];
    setGenres: (genres: string[]) => void;
}

const useGenresStore = create<GenresState>((set) => ({
    genres: [],
    setGenres: (action) => set({ genres: action }),
}));

export default useGenresStore;
