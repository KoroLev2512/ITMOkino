import React from "react";
import Home from "@/pages/home/index";
import {GetServerSideProps, NextPage} from "next";
import {useUserStore} from "@/entities/user";

interface UserState {
    user: any;
}

interface IProps {
}

const MainPage: NextPage<IProps> = (props) => {
    const [user] = useUserStore((state: UserState) => [state.user]);

    return <Home/>;
    // return <Home user={user}/>;
};

export const getServerSideProps: GetServerSideProps<IProps | object> = async () => {
    try {
        return {
            props: {},
        };
    } catch (error) {
        return {props: {}};
    }
};

export default MainPage;