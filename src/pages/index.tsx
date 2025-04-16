import React, {useState, useEffect} from "react";
import {NextPage} from "next";
import {getMovies} from "@/lib/api";
import {Movie} from "@/entities/movie";
import HomePage from "@/pages/home/home";
import {Header} from "@/widgets/header";
import Loader from "@/shared/loader";

const MainPage: NextPage = () => {
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
            <>
                <Header title="ITMO"/>
                <Loader/>
            </>
        );
    }

    if (error || movies.length === 0) {
        return (
            <div>
                <Header title="ITMO KINO"/>
                <div style={{maxWidth: "1200px", margin: "auto", padding: "20px"}}>
                    <div style={{marginTop: "50px", textAlign: "center"}}>
                        <h2 style={{color: "#d32f2f", marginBottom: "10px"}}>Произошла ошибка при загрузке фильмов</h2>
                        <p style={{color: "#666", marginBottom: "20px"}}>{error || "Список фильмов пуст"}</p>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                padding: "10px 20px",
                                backgroundColor: "#2196f3",
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                                fontSize: "16px",
                            }}
                        >
                            Попробовать снова
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return <HomePage movies={movies}/>;
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

