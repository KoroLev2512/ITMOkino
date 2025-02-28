import { movieApi } from "@/app/api/movieApi";
import {Movie, MovieWithSessions} from "@/entities/movie";

const moviesApi = movieApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllMovies: builder.query<Movie[], void>({
            query: () => "movies",
        }),
        getMovieById: builder.query<MovieWithSessions, number>({
            query: (id) => `movies/${id}&_embed_sessions`,
            transformResponse(data: MovieWithSessions[]) {
                return data[0];
            }
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