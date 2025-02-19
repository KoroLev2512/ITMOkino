import React from 'react';
import { IMovieCard } from "@/entities/movie";
import { MovieCard } from "@/widgets/card/index";
import classNames from "classnames";
import { useSelector } from "react-redux";
import styles from "./styles.module.scss";
import { RootState } from "@/shared/store";

interface MovieListProps {
    className?: string;
}

export const MovieList = ({ className }: MovieListProps) => {
    const classes = classNames(styles.movieList, className);
    const { data } = useSelector((state: RootState) => state.movies);

    function renderList(data: IMovieCard[]) {
        return data.map((movie: IMovieCard) => (
            <MovieCard
                key={movie.title}
                data={{
                    id: movie.id,
                    title: movie.title,
                    description: movie.description || "",
                    className: styles.card,
                    image: <img src={movie.image} alt={movie.title} />
                }}
            />
        ));
    }

    return (
        <div className={classes}>
            {renderList(data)}
        </div>
    );
};