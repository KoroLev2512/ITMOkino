import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Movie} from "@/entities/movie";

interface MoviesState {
    data: Movie[];
}

const initialState: MoviesState = {
    data: [
        {
            id: 1,
            image: "/images/kino.jpg",
            title: "Кофе",
            genre: "Комедия",
            description: "Фильм про кофе",
            actors: ["Игорь Гомжин", "Альтер эго Игоря Гомжина"],
            duration: 120,
            year: 2021,
            times: ["18:00", "20:00"],
        },
        {
            id: 2,
            image: "/images/kino.jpg",
            title: "Чай",
            genre: "Комедия",
            description: "Фильм про чай",
            actors: ["Иван Иванов", "Петр Петров"],
            duration: 120,
            year: 2021,
            times: ["12:00", "14:00", "16:00", "18:00", "20:00"],
        },
        {
            id: 3,
            image: "/images/kino.jpg",
            title: "Какао",
            description: "Фильм про какао",
            genre: "Комедия",
            actors: ["Иван Иванов", "Петр Петров"],
            duration: 120,
            year: 2021,
            times: ["12:00", "14:00", "16:00", "18:00", "20:00"],
        },
        {
            id: 4,
            title: "Елки ИТМО",
            description: "Кринж теперь в ИТМО (хотя он никуда и не уходил)",
            genre: "Кринж",
            image: "/images/kino.jpg",
            actors: ["Иван Иванов", "Петр Петров"],
            duration: 120,
            year: 2021,
            times: ["12:00", "14:00", "16:00", "18:00", "20:00"],
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
