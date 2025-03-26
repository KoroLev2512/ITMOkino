import { movieApi } from "@/app/api/movieApi";
import {Movie, MovieWithSessions} from "@/entities/movie";

const moviesApi = movieApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllMovies: builder.query<Movie[], void>({
            query: () => "api/movies",
        }),
        getMovieById: builder.query<MovieWithSessions, number>({
            query: (id) => `api/movies/${id}`,
            transformResponse(data: MovieWithSessions[]) {
                return data[0];
            }
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
    overrideExisting: true,
});

export const { 
    useGetAllMoviesQuery, 
    useGetMovieByIdQuery,
    useCreateMovieMutation,
    useUpdateMovieMutation,
    useDeleteMovieMutation 
} = moviesApi;