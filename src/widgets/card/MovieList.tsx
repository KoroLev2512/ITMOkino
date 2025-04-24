import React from 'react';
// import { IMovieCard } from "@/entities/movie";
// import { MovieCard } from "@/widgets/card/index";
import Link from "next/link";
import { Movie } from "@/entities/movie";
import styles from "./styles.module.scss";
import Image from "next/image";

interface MovieListProps {
    movies: Movie[];
}

export const MovieList = ({ movies }: MovieListProps) => {
    return (
        <div className={styles.moviesGrid}>
            {movies.map((movie) => (
                <Link href={`/movie/${movie.id}`} key={movie.id}>
                    <div className={styles.movieCard}>
                        {movie.image ? (
                            <Image
                                src={movie.image}
                                alt={movie.title}
                                className={styles.movieImage}
                                width={200}
                                height={300}
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
    );
};

export default MovieList;
