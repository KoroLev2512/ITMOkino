import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Text } from "@/shared/ui/Text";
import Link from "next/link";
import styles from "./styles.module.scss";

export const Soon = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.25 });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 1 }}
        >
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 1, delay: 0.2 }}
            >
                <Text className={styles.soon}>Выбирайте сеанс <span className={styles.highlightMargin}> и регистрируйтесь</span></Text>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 1, delay: 0.4 }}
            >
                <div className={styles.buttons}>
                    <Link href='/movie/1'
                          className={styles.registration_button}
                          target="_blank"
                          rel="noopener noreferrer">
                        16:30
                    </Link>
                    <Link href='movie/1'
                          className={styles.registration_button}
                          target="_blank"
                          rel="noopener noreferrer">
                        19:00
                    </Link>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 1, delay: 0.6 }}
                className={styles.land}
            >
                <motion.img
                    src="/images/landing.svg"
                    alt="header"
                />
                <div className={styles.tg}>
                    следите за нами в tg:
                    <Link href="https://t.me/cgitmo/" className={styles.tg_link}>
                        @cgitmo
                    </Link>
                </div>
            </motion.div>
        </motion.div>
    );
};