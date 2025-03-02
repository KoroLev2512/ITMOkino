import React from "react";
import { GetServerSideProps, NextPage } from "next";
import MoviePage from "@/pages/movie/[id]";
import {MovieWithSessions} from "@/entities/movie";

interface IMovieProps {
    movie: MovieWithSessions;
}

const MainPage: NextPage<IMovieProps> = ({ movie }) => {
    return <MoviePage movie={movie} />;
};

export const getServerSideProps: GetServerSideProps<IMovieProps> = async () => {
    try {

        const movie: MovieWithSessions = {
            id: 1,
            title: "ITMO Kino",
            description: "Фильм про кофе",
            image: "/images/kino.jpg",
            actors: ["Игорь Гомжин", "и все его альтер эго"],
            times: ["10:00", "12:00"],
            sessions: [
                { id: 1, movieId: 1, time: "19:00", seatId: 101 },
                { id: 2, movieId: 1, time: "21:00", seatId: 102 }
            ]
        };
        return { props: { movie } };
    } catch (error) {
        return { props: { movie: { id: 0, title: "", description: "", image: "", actors: [], times: [], sessions: [] } } };
    }
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

