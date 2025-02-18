export interface IMovieCard {
    image: string;
    title: string;
    description: string;
}

export interface Movie extends IMovieCard {
    times: string[];
    genre: string;
}
