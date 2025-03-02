import {BuySeatsFromServer} from "@/entities/movie/types/seat";

export interface Session {
    id: number;
    movieId: number;
    seatId: number;
    time: string;
    seat?: BuySeatsFromServer
}
