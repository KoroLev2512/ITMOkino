import React from 'react';
import { IMovieCard } from "@/entities/movie";
import { MovieCard } from "@/widgets/card/index";
import classNames from "classnames";
import styles from "./styles.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "@/shared/store";
import { useGetAllMoviesQuery } from "@/app/api/movie";

interface MovieListProps {
    className?: string;
}

export const MovieList = ({ className }: MovieListProps) => {
    const classes = classNames(styles.movieList, className);
    const { data, isLoading } = useGetAllMoviesQuery();

    function renderList(movies: IMovieCard[]) {
        return movies.map((movie) => (
            <MovieCard
                key={movie.id}
                data={movie}
            />
        ));
    }

    if(isLoading) return <div>Loading...</div>;
    if(!data) return <div>No data</div>;

    return (
        <div className={classes}>
            {renderList(data)}
        </div>
    );
};
