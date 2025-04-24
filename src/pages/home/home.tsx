// import {Text} from "@/shared/ui/Text";
// import {MovieList} from "@/widgets/card";

import { Header } from "@/widgets/header";
import { Movie } from "@/entities/movie";
import MovieList from "@/widgets/card/MovieList";
import styles from "./home.styles.module.scss";

interface HomePageProps {
    movies: Movie[];
}

export const HomePage = ({ movies }: HomePageProps) => {
    return (
        <div>
            <Header title="ITMO КINO" />
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>Афиша кинотеатра</h1>
                <MovieList movies={movies} />
            </div>
        </div>
    );
};

export default HomePage;
