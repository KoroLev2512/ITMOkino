import React, { useState, useEffect } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { getMovies } from "@/lib/api";
import { Movie } from "@/entities/movie";
import { Header } from "@/widgets/header";
import Loader from "@/shared/loader";
import Link from "next/link";

const styles = {
  container: { 
    maxWidth: '1200px', 
    margin: '0 auto', 
    padding: '20px' 
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '600',
    marginBottom: '20px',
    textAlign: 'center' as 'center',
    color: '#333'
  },
  moviesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '30px',
    marginTop: '30px'
  },
  movieCard: {
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    backgroundColor: 'white',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 6px 15px rgba(0, 0, 0, 0.15)'
    }
  },
  movieImage: {
    width: '100%',
    aspectRatio: '2/3',
    objectFit: 'cover' as 'cover'
  },
  noImage: {
    width: '100%',
    height: '300px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    color: '#888',
    fontSize: '16px'
  },
  movieInfo: {
    padding: '15px'
  },
  movieTitle: {
    margin: '0 0 5px 0',
    fontSize: '18px',
    fontWeight: 500,
    color: '#333'
  },
  movieGenre: {
    margin: 0,
    fontSize: '14px',
    color: '#666'
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh'
  },
  errorContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px'
  },
  error: {
    marginTop: '50px',
    textAlign: 'center' as 'center'
  },
  errorTitle: {
    color: '#d32f2f',
    marginBottom: '10px'
  },
  errorText: {
    color: '#666',
    marginBottom: '20px'
  },
  retryButton: {
    padding: '10px 20px',
    backgroundColor: '#2196f3',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px'
  }
};

const MainPage: NextPage = () => {
    const router = useRouter();
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(true);
            try {
                const data = await getMovies();
                setMovies(data);
                setError("");
            } catch (err) {
                console.error("Error fetching movies:", err);
                setError("Failed to load movies");
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, []);

    if (loading) {
        return (
            <div>
                <Header title="ITMO" />
                <div style={styles.loadingContainer}>
                    <Loader />
                </div>
            </div>
        );
    }

    if (error || movies.length === 0) {
        return (
            <div>
                <Header title="ITMO" />
                <div style={styles.errorContainer}>
                    <div style={styles.error}>
                        <h2 style={styles.errorTitle}>Произошла ошибка при загрузке фильмов</h2>
                        <p style={styles.errorText}>{error || "Список фильмов пуст"}</p>
                        <button onClick={() => window.location.reload()} style={styles.retryButton}>
                            Попробовать снова
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Header title="ITMO" />
            <div style={styles.container}>
                <h1 style={styles.pageTitle}>Афиша кинотеатра</h1>
                <div style={styles.moviesGrid}>
                    {movies.map((movie) => (
                        <Link href={`/movie/${movie.id}`} key={movie.id}>
                            <div style={styles.movieCard}>
                                {movie.image ? (
                                    <img 
                                        src={movie.image} 
                                        alt={movie.title} 
                                        style={styles.movieImage}
                                    />
                                ) : (
                                    <div style={styles.noImage}>Нет изображения</div>
                                )}
                                <div style={styles.movieInfo}>
                                    <h3 style={styles.movieTitle}>{movie.title}</h3>
                                    <p style={styles.movieGenre}>{movie.genre}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MainPage;

// import React, {useEffect} from "react";
// import {GetServerSideProps, NextPage} from "next";
// import {useDispatch, useSelector} from "react-redux";
// import {setUser} from "@/shared/store/slices/userSlice";
// import {RootState} from "@/shared/store";
// import {Movie} from "@/entities/movie";
// import HomePage from "@/pages/home";
// // import {useUserStore} from "@/entities/user";
//
// // interface UserState {
// //     user: any;
// // }
//
// interface MovieProps {
//     movie: Movie;
// }
//
// const MainPage: NextPage<MovieProps> = ({ movie }) => {
//     return <HomePage/>;
// };
//
// // const dispatch = useDispatch();
// // const user = useSelector((state: RootState) => state.user.user);
//
// // useEffect(() => {
// //     if (!user) {
// //         dispatch(setUser({id: 1, name: "Test User"}));
// //     }
// // }, [user, dispatch]);
// // if (isLoading) return <div>Loading...</div>
//
// export const getServerSideProps: GetServerSideProps<MovieProps | object> = async () => {
//     try {
//         return {props: {}};
//     } catch (error) {
//         return {props: {}};
//     }
// };
//
// export default MainPage;

