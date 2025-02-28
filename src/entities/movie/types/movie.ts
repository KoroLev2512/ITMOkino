import {Session} from "@/entities/movie/types/session";

export interface IMovieCard {
    id: number;
    image: any;
    title: string;
    description: string;
    className?: string;
}

export interface Movie extends IMovieCard {
    times?: string[];
    genre?: string;
    actors?: string[];
    duration?: number;
    year?: number;
}

export interface MovieWithSessions extends Movie {
    sessions: Session[];
}
