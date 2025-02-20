import {BaseQueryMeta, BaseQueryResult, createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";

export const movieApi = createApi({
    reducerPath: "movieApi",
    baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3001/" }),
    endpoints: (builder) => ({
        getAllMovies: builder.query({
            query: () => "movies",
        }),
        getMovieById: builder.query({
            query: (id) => `movies?id/${id}`,
        }),
        createMovie: builder.mutation({
            query: (movie) => ({
                url: "movies",
                method: "POST",
                body: movie,
            }),
        }),
        updateMovie: builder.mutation({
            query: (movie) => ({
                url: `movies/${movie.id}`,
                method: "PUT",
                body: movie,
            }),
        }),
        deleteMovie: builder.mutation({
            query: (id: string) => ({
                url: `movies/${id}`,
                method: "DELETE",
            }),
        }),
    }),
});
