import classNames from "classnames";
import React, {ReactNode} from "react";
import {Text} from "@/shared/ui/Text";
import Link from "next/link";
// import {useDispatch} from "react-redux";
// import {setMovieTitle} from "@/store/slices/moviesSlice";
import styles from "./styles.module.scss";

interface MovieCardProps {
    data: {
        id: number;
        image?: ReactNode;
        title: string;
        description: string;
        className?: string;
    };
    className?: string;
}

export const MovieCard = (props: MovieCardProps) => {
    // const dispatch = useDispatch();
    // const onClick = () => {
    //     dispatch(setMovieTitle({
    //         id: props.data.id,
    //         title: props.data.title + '!'
    //     }));
    // }
    return (
        <Link href='/movie' className={classNames(styles.card, props.className, props.data.className)}>
            <div className={styles.content}>
                <div className={styles.image}>{props.data.image}</div>
                <Text className={styles.title}>{props.data.title}</Text>
                <Text className={styles.description}>{props.data.description}</Text>
            </div>
        </Link>
    );
};