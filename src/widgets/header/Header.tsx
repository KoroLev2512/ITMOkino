import React from 'react';
import Link from "next/link";
import styles from './styles.module.scss';
import {Text} from "@/shared/ui/Text";

export type HeaderProps = {
    title: string;
    className?: string;
};

export const Header = (props: HeaderProps) => {
    return (
        <header className={styles.wrapper}>
            <Link href='/'>
                <button className={styles.backButton}>
                    Главная
                </button>
            </Link>
            <Text center className={styles.title}>
                {props.title}
            </Text>
        </header>
    );
};
