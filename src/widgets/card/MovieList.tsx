import React from 'react';
import { IMovieCard } from "@/entities/movie";
import { MovieCard } from "@/widgets/card/index";
import classNames from "classnames";
import styles from "./styles.module.scss";
import {useSelector} from "react-redux";
import {RootState} from "@/shared/store";

interface MovieListProps {
    className?: string;
}

export const MovieList = ({ className }: MovieListProps) => {
    const classes = classNames(styles.movieList, className);
    // const { isLoading, data } = useGetAllMoviesQuery();

    const data = useSelector((state: RootState) => state.movies.data);

    function renderList(data: IMovieCard[]) {
        return data.map((movie) => (
            <MovieCard
                key={movie.id}
                data={movie}
            />
        ));
    }

    // if(isLoading) return <div>Loading...</div>;
    if(!data) return <div>No data</div>;

    return (
        <div className={classes}>
            {renderList(data)}
        </div>
    );
};
