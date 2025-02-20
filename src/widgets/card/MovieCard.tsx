import classNames from "classnames";
import React from "react";
import {Text} from "@/shared/ui/Text";
import Link from "next/link";
import {IMovieCard} from "@/entities/movie";
import styles from "./styles.module.scss";

// import {useDispatch} from "react-redux";
// import {setMovieTitle} from "@/store/slices/moviesSlice";

interface MovieCardProps {
    data: IMovieCard
}

export const MovieCard = ({data}: MovieCardProps) => {
    // const dispatch = useDispatch();
    // const onClick = () => {
    //     dispatch(setMovieTitle({
    //         id: props.data.id,
    //         title: props.data.title + '!'
    //     }));
    // }
    return (
        <Link href={`/movie/${data.id}`} className={classNames(styles.card, data.className)}>
            <div className={styles.content}>
                <div className={styles.image}>
                    <img src={data.image} alt={data.title}/>
                </div>
                <Text className={styles.title}>{data.title}</Text>
                <Text className={styles.description}>{data.description}</Text>
            </div>
        </Link>
    );
};