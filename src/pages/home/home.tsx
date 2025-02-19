import React from "react";
import {Text} from "@/shared/ui/Text";
import {MovieList} from "@/widgets/card/MovieList";
import styles from "./home.styles.module.scss";
import {useGetPokemonByNameQuery} from "@/app/api/rtkApi";

const Home = () => {
    const { data, error, isLoading } = useGetPokemonByNameQuery('bulbasaur')

    return (
        <div className={styles.wrapper}>
            <Text center children={"Welcome to itmokino"} className={styles.title}/>
            <MovieList className={styles.movieList}/>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
};

export default Home;