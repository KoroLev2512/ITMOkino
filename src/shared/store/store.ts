import { configureStore } from "@reduxjs/toolkit";
import { moviesReducer, orderReducer } from "./slices";
import { movieApi } from "@/app/api/movieApi";
// import { userApi } from "./services/userApi";

export const store = configureStore({
    reducer: {
        movies: moviesReducer,
        order: orderReducer,
        [movieApi.reducerPath]: movieApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(movieApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;