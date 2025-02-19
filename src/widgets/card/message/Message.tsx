import { MovieCard } from "@/widgets/card/MovieCard";
import styles from "./styles.module.scss";
import { ReactNode } from "react";

export interface MessageProps {
    id: number;
    className: string;
    title: string;
    description: string;
    image?: ReactNode;
}

export const Message = (props: MessageProps) => {
    return <MovieCard data={props} className={styles.message} />;
};