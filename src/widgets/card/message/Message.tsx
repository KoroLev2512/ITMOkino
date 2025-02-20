import { MovieCard } from "@/widgets/card/MovieCard";
import { IMovieCard } from "@/entities/movie";

export interface MessageProps extends IMovieCard {}

export const Message = (props: MessageProps) => {
    return <MovieCard data={props}/>;
};
