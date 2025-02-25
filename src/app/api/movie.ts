import { movieApi } from "@/app/api/movieApi";
import {Movie} from "@/entities/movie";

const moviesApi = movieApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllMovies: builder.query<Movie[], void>({
            query: () => "movies",
        }),
        getMovieById: builder.query<Movie, number>({
            query: (id) => `movies/${id}`
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
    overrideExisting: true,
});

export const { useGetAllMoviesQuery, useGetMovieByIdQuery } = moviesApi;