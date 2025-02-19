import React, {useEffect} from "react";
import Home from "@/pages/home/index";
import {GetServerSideProps, NextPage} from "next";
import {useDispatch, useSelector} from "react-redux";
import {setUser} from "@/shared/store/slices/userSlice";
import {RootState} from "@/shared/store";
// import {useUserStore} from "@/entities/user";

// interface UserState {
//     user: any;
// }

interface IProps {
}

const MainPage: NextPage = () => {
    // const dispatch = useDispatch();
    // const user = useSelector((state: RootState) => state.user.user);

    // useEffect(() => {
    //     if (!user) {
    //         dispatch(setUser({id: 1, name: "Test User"}));
    //     }
    // }, [user, dispatch]);

    // if (isLoading) return <div>Loading...</div>

    return <Home/>;
};

export const getServerSideProps: GetServerSideProps<IProps | object> = async () => {
    try {
        return {props: {}};
    } catch (error) {
        return {props: {}};
    }
};

export default MainPage;
