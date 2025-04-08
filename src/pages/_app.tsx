// import React from "react";
// import type { AppProps } from "next/app";
// import AppWrapper from "@/features/wrappers/AppWrapper";
// import {ServerGuard} from "@/app/guards/ServerGuard";
// import "@/app/styles/globals.scss";
//
// const App = ({ Component, pageProps }: AppProps) => {
// 	return (
// 		<ServerGuard>
// 			<AppWrapper>
// 				<Component {...pageProps} />
// 			</AppWrapper>
// 		</ServerGuard>
// 	);
// };
//
// export default App;

import React, { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { store } from "@/shared/store/store";
import { useRouter } from "next/router";
import { useAppStore } from "@/lib/appStore";
import "@/app/styles/globals.scss";

const AuthStateHandler = ({ children }: { children: React.ReactNode }) => {
	const router = useRouter();
	const [isAuthChecked, setIsAuthChecked] = useState(false);
	
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const publicPaths = ['/login', '/register', '/'];
			const isPublicPath = publicPaths.some(path => 
				router.pathname === path || router.pathname.startsWith('/movie')
			);
			
			const isAdminPath = router.pathname.startsWith('/admin');
			const isProtectedPath = router.pathname.startsWith('/ticket');
			
			if (isPublicPath) {
				setIsAuthChecked(true);
				return;
			}
			
			if (isAdminPath || isProtectedPath) {
				const token = localStorage.getItem('auth_token');
				const userData = localStorage.getItem('user');
				
				if (!token || !userData) {
					router.push('/login');
					return;
				}
				
				if (isAdminPath) {
					try {
						const user = JSON.parse(userData);
						if (!user.isAdmin) {
							router.push('/');
							return;
						}
					} catch (e) {
						console.error('Error parsing user data', e);
						router.push('/login');
						return;
					}
				}
			}
			
			setIsAuthChecked(true);
		} else {
			setIsAuthChecked(true);
		}
	}, [router.pathname]);
	
	if (!isAuthChecked) {
		return <div className="loading-auth">Loading...</div>;
	}
	
	return <>{children}</>;
};

const ThemeManager = () => {
	const isDarkMode = useAppStore(state => state.isDarkMode);

	useEffect(() => {
		const root = document.documentElement;
		root.setAttribute("data-theme", isDarkMode ? "dark" : "light");
	}, [isDarkMode]);

	return null;
};


const App = ({ Component, pageProps }: AppProps) => {
	return (
		<Provider store={store}>
			<AuthStateHandler>
				<ThemeManager />
				<Component {...pageProps} />
			</AuthStateHandler>
		</Provider>
	);
};

export default App;
