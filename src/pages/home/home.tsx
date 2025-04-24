// import {Text} from "@/shared/ui/Text";
// import {MovieList} from "@/widgets/card";

import React from "react";
import {Header} from "@/widgets/header";
import {Movie} from "@/entities/movie";
import MovieList from "@/widgets/card/MovieList";
import styles from "./home.styles.module.scss";

interface HomePageProps {
    movies: Movie[];
    error?: Error | string;
}

const HomePage: React.FC<HomePageProps> = ({movies, error}) => {
    if (error || movies.length === 0) {
        return (
            <>
                <Header title="ITMO KINO"/>
                <div className={styles.errorContainer}>
                    <h2 className={styles.errorTitle}>Произошла ошибка при загрузке фильмов</h2>
                    <p className={styles.errorText}>
                        {typeof error === "string" ? error : error?.message}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className={styles.retryButton}
                    >
                        Попробовать снова
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            <Header title="ITMO KINO" />
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>Афиша кинотеатра</h1>
                <MovieList movies={movies} />
            </div>
        </>
    );
};

export default HomePage;
