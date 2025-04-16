// import {Text} from "@/shared/ui/Text";
// import {MovieList} from "@/widgets/card";

import {Header} from "@/widgets/header";
import Link from "next/link";
import {Movie} from "@/entities/movie";
import styles from "./home.styles.module.scss";

interface HomePageProps {
    movies: Movie[];
}

export const HomePage = ({movies}: HomePageProps) => {
    return (
        <div>
            <Header title="ITMO КINO"/>
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>Афиша кинотеатра</h1>
                <div className={styles.moviesGrid}>
                    {movies.map((movie) => (
                        <Link href={`/movie/${movie.id}`} key={movie.id}>
                            <div className={styles.movieCard}>
                                {movie.image ? (
                                    <img
                                        src={movie.image}
                                        alt={movie.title}
                                        className={styles.movieImage}
                                    />
                                ) : (
                                    <div className={styles.noImage}>Нет изображения</div>
                                )}
                                <div className={styles.movieInfo}>
                                    <h3 className={styles.movieTitle}>{movie.title}</h3>
                                    <p className={styles.movieGenre}>{movie.genre}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            {/*<div className={styles.wrapper}>*/}
            {/*<Text center className={styles.title}>*/}
            {/*    Welcome to itmokino*/}
            {/*</Text>*/}
            {/*<MovieList/>*/}
            {/*</div>*/}
        </div>
    );
};

export default HomePage;
