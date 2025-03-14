import React, { useRef, RefObject } from 'react';
import { motion, useInView } from 'framer-motion';
import styles from "./styles.module.scss";
import { Title } from '../Title';

interface HeadProps {
    soonRef: RefObject<HTMLDivElement | null>;
}

export const Head: React.FC<HeadProps> = ({ soonRef }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.25 });

    const handleScrollToSoon = () => {
        if (soonRef.current) {
            soonRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 1 }}
        >
            <div className={styles.logotips}>
                <motion.img
                    className={styles.itmo}
                    src="/images/itmo.png"
                    alt="logo"
                    initial={{ opacity: 0, y: -20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 1, delay: 0.2 }}
                />
                <motion.img
                    className={styles.logo}
                    src="/icons/logo_horizontal.svg"
                    alt="logo"
                    initial={{ opacity: 0, y: -20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 1, delay: 0.2 }}
                />
            </div>
            <Title className={styles.title}>
                <motion.span
                    className={styles.highlight}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 1, delay: 0.4 }}
                >
                    Мы сделали кино
                </motion.span>
                <br />
                <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 1, delay: 0.6 }}
                >
                    и приглашаем вас
                </motion.span>
                <br />
                <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 1, delay: 0.8 }}
                >
                    его посмотреть
                </motion.span>
            </Title>
            <motion.div
                className={styles.description}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 1, delay: 0.6 }}
            >
                В кинозале отеля «Москва» на площади Александра Невского вас будет ждать первый, долгожданный показ нашего фильма, над которым мы долго и кропотливо трудились, чтобы создать нечто особенное…<br />
                Присоединяйтесь, чтобы погрузиться в по-настоящему захватывающий мир и попробовать на вкус кино, созданное с душой.
            </motion.div>
            <motion.img
                src="/images/header.png"
                alt="header"
                className={styles.image}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 1, delay: 0.8 }}
            />
            <motion.button
                className={styles.button}
                onClick={handleScrollToSoon}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 1, delay: 1 }}
            >
                Зарегистрироваться
            </motion.button>
        </motion.div>
    );
};
