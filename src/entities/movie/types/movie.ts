export interface IMovieCard {
    id: number;
    image: string;
    title: string;
    description: string;
    className?: string;
}

export interface Movie extends IMovieCard {
    times: string[];
    genre: string;
}
