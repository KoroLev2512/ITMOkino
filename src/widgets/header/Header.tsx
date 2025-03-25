import React, { useState, useEffect } from 'react';
import Link from "next/link";
import styles from './styles.module.scss';
import { Text } from "@/shared/ui/Text";

export type HeaderProps = {
    title: string;
    className?: string;
};

export const Header = (props: HeaderProps) => {
    const [user, setUser] = useState<{ id: number; username: string; isAdmin: boolean } | null>(null);
    
    useEffect(() => {
        // Check if user is logged in
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (e) {
                console.error('Error parsing user data', e);
            }
        }
    }, []);
    
    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/';
    };
    
    return (
        <header className={styles.wrapper}>
            <div className={styles.leftSection}>
                <Link href='/'>
                    <button className={styles.backButton}>
                        Главная
                    </button>
                </Link>
            </div>
            
            <Text center className={styles.title}>
                {props.title}
            </Text>
            
            <div className={styles.rightSection}>
                {user ? (
                    <>
                        <span className={styles.username}>{user.username}</span>
                        {user.isAdmin && (
                            <Link href='/admin'>
                                <button className={styles.adminButton}>
                                    Администрирование
                                </button>
                            </Link>
                        )}
                        <button 
                            onClick={handleLogout} 
                            className={styles.logoutButton}
                        >
                            Выйти
                        </button>
                    </>
                ) : (
                    <Link href='/login'>
                        <button className={styles.loginButton}>
                            Войти
                        </button>
                    </Link>
                )}
            </div>
        </header>
    );
};
