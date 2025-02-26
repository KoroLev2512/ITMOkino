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

import React from "react";
import { GetServerSideProps, NextPage } from "next";
import MoviePage from "@/pages/movie/[id]";

interface IProps {
    movie: {
        id: number;
        title: string;
        description: string;
        image: string;
        actors: string[];
        times: string[];
    };
}

const MainPage: NextPage<IProps> = ({ movie }) => {
    return <MoviePage movie={movie} />;
};

export const getServerSideProps: GetServerSideProps<IProps> = async () => {
    try {
        const movie = {
            id: 1,
            title: "ITMO Kino",
            description: "Фильм про кофе",
            image: "/images/kino.jpg",
            actors: ["Игорь Гомжин", "и все его альтер эго"],
            times: ["10:00", "12:00"]
        };
        return { props: { movie } };
    } catch (error) {
        return { props: { movie: { id: 0, title: "", description: "", image: "", actors: [], times: [] } } };
    }
};

export default MainPage;

