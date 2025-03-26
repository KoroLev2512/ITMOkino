import { configureStore } from "@reduxjs/toolkit";
import { orderReducer, userReducer } from "./slices";
import { movieApi } from "@/app/api/movieApi";

export const store = configureStore({
    reducer: {
        user: userReducer,
        order: orderReducer,
        [movieApi.reducerPath]: movieApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(movieApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;