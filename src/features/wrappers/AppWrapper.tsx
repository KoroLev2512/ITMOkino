import Head from "next/head";
import React, {useEffect} from "react";
import ContentWrapper from "@/features/wrappers/ContentWrapper/ContentWrapper";
import {useMountEffect} from "@/shared/hooks/useMountEffect";
import {useAppStore} from "@/shared/store/appStore";
import {parseCookies} from "nookies";
import {Layout} from "./types";
import {PageWrapper} from "@/features/wrappers/PageWrapper";

const AppWrapper = (props: Layout) => {
    const {children} = props;
    const [isDarkMode, toggleDarkMode] = useAppStore(state => [state.isDarkMode, state.toggleDarkMode]);
    const defaultTheme = parseCookies().theme || "light";

    // useEffect(() => {
    //     if (window.innerWidth <= 720) {
    //         toggleProfilePage(false);
    //     }
    // }, [toggleProfilePage]);

    useMountEffect(() => {
        if (defaultTheme) {
            toggleDarkMode(defaultTheme === "dark");
        } else {
            toggleDarkMode(false);
        }
    });

    useEffect(() => {
        if (isDarkMode === true) {
            document.documentElement.setAttribute("data-theme", "dark");
        } else {
            document.documentElement.removeAttribute("data-theme");
        }
    }, [isDarkMode]);

    return (
        <PageWrapper>
            <Head>
                <title>ITMO.KINO</title>
            </Head>
            {/*<NavigationBar />*/}
            <ContentWrapper>{children}</ContentWrapper>
        </PageWrapper>
    );
};

export default AppWrapper;
