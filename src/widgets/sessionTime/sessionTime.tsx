import React from 'react';
import Link from "next/link";
import classNames from "classnames";
import styles from "./styles.module.scss";

interface sessionTimeProps {
    id: number;
    time: string;
}

export const SessionTime = ({id, time}: sessionTimeProps) => {
    return (
        <Link href={`/ticket/${id}`} className={classNames(styles.sessionTime)}>
            {time}
        </Link>
    );
};
