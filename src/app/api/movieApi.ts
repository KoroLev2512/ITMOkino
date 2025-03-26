import {BaseQueryMeta, BaseQueryResult, createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";

export const movieApi = createApi({
    reducerPath: "movieApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/" }),
    endpoints: (builder) => ({
        getAllMovies: builder.query({
            query: () => "api/movies",
        }),
        getMovieById: builder.query({
            query: (id) => `api/movies/${id}`,
        }),
        createMovie: builder.mutation({
            query: (movie) => ({
                url: "api/movies",
                method: "POST",
                body: movie,
            }),
        }),
        updateMovie: builder.mutation({
            query: (movie) => ({
                url: `api/movies/${movie.id}`,
                method: "PUT",
                body: movie,
            }),
        }),
        deleteMovie: builder.mutation({
            query: (id: string) => ({
                url: `api/movies/${id}`,
                method: "DELETE",
            }),
        }),
    }),
});
