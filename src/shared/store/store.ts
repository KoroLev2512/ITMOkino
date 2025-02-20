import { configureStore } from "@reduxjs/toolkit";
// import { userApi } from "./services/userApi";
import { moviesReducer } from "./slices/moviesSlice";
import {movieApi} from "@/app/api/movieApi";

export const store = configureStore({
    reducer: {
        movies: moviesReducer,
        [movieApi.reducerPath]: movieApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(movieApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
