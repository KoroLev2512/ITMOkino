import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Определяем API
export const userApi = createApi({
    reducerPath: "userApi",
    baseQuery: fetchBaseQuery({ baseUrl: "https://jsonplaceholder.typicode.com" }),
    endpoints: (builder) => ({
        getUsers: builder.query<any[], void>({
            query: () => "/users",
        }),
        getUserById: builder.query<any, number>({
            query: (id) => `/users/${id}`,
        }),
    }),
});

// Экспортируем хуки
export const { useGetUsersQuery, useGetUserByIdQuery } = userApi;
