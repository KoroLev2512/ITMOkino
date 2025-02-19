import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {IMovieCard} from "@/entities/movie";

interface MoviesState {
    data: IMovieCard[];

}

const initialState: MoviesState = {
    data: [
        {
            id: 1,
            title: "Кофе",
            description: "Фильм про кофе",
            image: "/images/kino.jpg",
        },
        {
            id: 2,
            title: "Чай",
            description: "Фильм про чай",
            image: "/images/kino.jpg",
        },
        {
            id: 3,
            title: "Какао",
            description: "Фильм про какао",
            image: "/images/kino.jpg",
        },
        {
            id: 4,
            title: "Елки ИТМО",
            description: "Кринж теперь в ИТМО (хотя он никуда и не уходил)",
            image: "/images/kino.jpg",
        },
    ]
}

const moviesSlice = createSlice({
    name: 'movieSlice',
    initialState,
    reducers: {
        setMovieTitle: (state, action: PayloadAction<{id: number, title: string}>) => {
            const { id, title } = action.payload;
            state.data.forEach((movie) => {
                if (movie.id === id) {
                    movie.title = title;
                }
            });
        }
    }
});

export const { setMovieTitle } = moviesSlice.actions;
export const moviesReducer = moviesSlice.reducer;
