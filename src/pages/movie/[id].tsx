import React, { useEffect, useState } from 'react';
import { useRouter } from "next/router";
import { Text } from "@/shared/ui/Text";
import Link from "next/link";
import { SessionTime } from "@/widgets/sessionTime";
import { InfoTable } from "@/widgets/infoTable";
import { helpers } from "@/shared/utils/helpers";
import styles from './movie.styles.module.scss';
import { Session } from "@/entities/movie/types";
import { getMovie, getSessions } from "@/lib/api";
import { Header } from "@/widgets/header";
import Loader from "@/shared/loader";

// Define a more complete Movie type based on our API response
interface MovieResponse {
    id: number;
    image: string;
    title: string;
    genre: string;
    description: string;
    duration: number;
    premiere: string;
    year: number;
    actors: string | string[];
}

interface MovieWithSessions extends MovieResponse {
    times?: string[];
    sessions: Session[];
}

const MoviePage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [movie, setMovie] = useState<MovieWithSessions | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Wait until id is available from router query
        if (!id) return;
        
        const fetchMovieData = async () => {
            setLoading(true);
            try {
                // Fetch from API
                const movieData = await getMovie(Number(id));
                const sessionsData = await getSessions(Number(id));
                
                // Transform data to match the expected format
                const movieWithSessions: MovieWithSessions = {
                    ...movieData,
                    actors: typeof movieData.actors === 'string' 
                        ? JSON.parse(movieData.actors) 
                        : movieData.actors,
                    times: sessionsData.map(session => session.time),
                    sessions: sessionsData
                };
                
                setMovie(movieWithSessions);
                setError('');
            } catch (err) {
                console.error("Error fetching movie:", err);
                setError('Failed to fetch movie data');
            } finally {
                setLoading(false);
            }
        };
        
        fetchMovieData();
    }, [id]);

    const renderSessionTimes = (sessions: Session[]) => {
        if (!sessions || sessions.length === 0) {
            return <div className={styles.noSessions}>Нет доступных сеансов</div>;
        }
        return sessions.map((session) => {
            return (
                <SessionTime 
                    key={`session-${session.id}`} 
                    id={session.id} 
                    time={session.time} 
                />
            );
        });
    };

    if (loading) {
        return (
            <div>
                <Header title="ITMO Кино" />
                <div className={styles.loading}>
                    <Loader />
                </div>
            </div>
        );
    }

    if (error || !movie) {
        return (
            <div>
                <Header title="ITMO Кино" />
                <div className={styles.error}>
                    <Text center className={styles.errorText}>К сожалению, этот фильм не найден</Text>
                    <Link href={'/'}>
                        <button className={styles.errorButton}>На главную</button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Header title="ITMO Кино" />
            <div className={styles.wrapper}>
                <div className={styles.content}>
                    <div className={styles.leftColumn}>
                        <div className={styles.image}>
                            {movie.image ? (
                                <img
                                    src={movie.image}
                                    alt={movie.title}
                                />
                            ) : (
                                <div className={styles.noImage}>Нет изображения</div>
                            )}
                        </div>
                        <div className={styles.description}>
                            {movie.description}
                        </div>
                    </div>
                    <div className={styles.rightColumn}>
                        <div className={styles.info}>
                            <InfoTable data={helpers.getInfoData(movie)} />
                        </div>
                        <div className={styles.session}>
                            <h3 className={styles.subtitle}>Сеансы</h3>
                            <div className={styles.sessionTimesList}>
                                {renderSessionTimes(movie.sessions || [])}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MoviePage;
