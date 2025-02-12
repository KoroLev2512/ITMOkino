// import React, { ReactNode, useEffect, useState, useRef } from "react";
// import WorkerPage from "@/pages/errors/503";
// import { useMountEffect } from "@/app/hooks/useMountEffect";
// import Loader from "@/shared/loader";
// import { useUserStore } from "@/entities/user";
// import { isNull, isString } from "lodash";
// import Router, { useRouter } from "next/router";
// import { PageWrapper } from "@/features/wrappers/PageWrapper";
//
// export const ServerGuard = ({ children }: { children: ReactNode }) => {
//     const [getUser, user, error] = useUserStore(store => [store.getUser, store.user, store.error]);
//     const { route } = useRouter();
//     const isOpenPath = ["/error", "/logger"].includes(route);
//
//     const userRef = useRef(user);
//
//     useEffect(() => {
//         if (!isString(error) && error?.status === 403 && !isOpenPath) {
//             window.location.replace("/api/login");
//         }
//     }, [error, isOpenPath, route]);
//
//     useMountEffect(() => {
//         if (!isOpenPath) {
//             getUser();
//         }
//     });
//
//     const [serverLoading, setServerLoading] = useState(false);
//
//     useMountEffect(() => {
//         if (!isOpenPath) {
//             const start = () => {
//                 setServerLoading(true);
//             };
//             const end = () => {
//                 setServerLoading(false);
//             };
//             Router.events.on("routeChangeStart", start);
//             Router.events.on("routeChangeComplete", end);
//             Router.events.on("routeChangeError", end);
//             return () => {
//                 Router.events.off("routeChangeStart", start);
//                 Router.events.off("routeChangeComplete", end);
//                 Router.events.off("routeChangeError", end);
//             };
//         }
//     });
//
//     useEffect(() => {
//         if (user !== userRef.current) {
//             userRef.current = user;
//         }
//     }, [user]);
//
//     if (serverLoading || (isNull(userRef.current) && !isOpenPath)) {
//         return (
//             <PageWrapper>
//                 <Loader />
//             </PageWrapper>
//         );
//     }
//
//     if (!isNull(error)) {
//         return <WorkerPage />;
//     }
//
//     if (!isNull(userRef.current) || isOpenPath) {
//         return children;
//     }
//
//     return <Loader />
// // };
