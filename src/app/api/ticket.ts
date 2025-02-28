import { movieApi } from "@/app/api/movieApi";
import {Session} from "@/entities/movie/types";

const ticketsApi = movieApi.injectEndpoints({
    endpoints: (builder) => ({
        getTicketById: builder.query<Session, string>({
            query: (id) => `ticket/${id}&_embed_seats`,
        }),
    }),
    overrideExisting: true,
});

export const { useGetTicketByIdQuery } = ticketsApi;