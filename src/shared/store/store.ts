import { configureStore } from "@reduxjs/toolkit";
// import { userApi } from "./services/userApi";
import { pokemonApi } from "@/app/api/rtkApi";
import { moviesReducer } from "./slices/moviesSlice";

export const store = configureStore({
    reducer: {
        movies: moviesReducer,
        [pokemonApi.reducerPath]: pokemonApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(pokemonApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
