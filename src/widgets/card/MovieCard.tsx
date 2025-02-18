import classNames from "classnames";
import React, {ReactNode} from "react";
import {Text} from "@/shared/ui/Text";
import Link from "next/link";
import styles from "./styles.module.scss";

export type CardProps = {
    image?: ReactNode;
    title: string;
    description: string;
    className?: string;
};

export const MovieCard = ({image, title, description, className}: CardProps) => {
    return (
        <Link href='/movie' className={classNames(styles.card, className)}>
            <div className={styles.content}>
                <div className={styles.image}>{image}</div>
                <Text className={styles.title}>{title}</Text>
                <Text className={styles.description}>{description}</Text>
            </div>
        </Link>
    );
};