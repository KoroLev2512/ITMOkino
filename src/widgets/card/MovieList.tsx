import React from 'react';
import { IMovieCard } from "@/entities/movie";
import { MovieCard } from "@/widgets/card/index";
import classNames from "classnames";
import styles from "./styles.module.scss";

const movies: IMovieCard[] = [
    {
        title: "Кофе",
        description: "Фильм про кофе",
        image: "/images/kino.jpg",
    },
    {
        title: "Чай",
        description: "Фильм про чай",
        image: "/images/kino.jpg",
    },
    {
        title: "Кофе",
        description: "Фильм про кофе",
        image: "/images/kino.jpg",
    },
    {
        title: "Чай",
        description: "Фильм про чай",
        image: "/images/kino.jpg",
    },
];

interface MovieListProps {
    className?: string;
}

export const MovieList = ({ className }: MovieListProps) => {
    const classes = classNames(styles.movieList, className);

    function renderList(data: IMovieCard[]) {
        return data.map((movie: IMovieCard) => (
            <MovieCard
                key={movie.title}
                title={movie.title}
                description={movie.description || ""}
                className={styles.card}
                image={<img src={movie.image} alt={movie.title} />}
            />
        ));
    }

    return (
        <div className={classes}>
            {renderList(movies)}
        </div>
    );
};