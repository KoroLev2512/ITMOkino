import { movieApi } from "@/app/api/movieApi";
import {Session} from "@/entities/movie/types";

const sessionApi = movieApi.injectEndpoints({
    endpoints: (builder) => ({
        getTicketById: builder.query<Session, string>({
            query: (id) => `ticket/${id}_expand=seat`,
        }),
    }),
    overrideExisting: true,
});

export const { useGetTicketByIdQuery } = sessionApi;