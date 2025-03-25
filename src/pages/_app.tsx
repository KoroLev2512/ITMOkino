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
import "@/app/styles/globals.scss";

// Component that handles auth state
const AuthStateHandler = ({ children }: { children: React.ReactNode }) => {
	const router = useRouter();
	const [isAuthChecked, setIsAuthChecked] = useState(false);
	
	useEffect(() => {
		// Check if we're on the client side
		if (typeof window !== 'undefined') {
			// List of paths that don't require auth check
			const publicPaths = ['/login', '/register', '/'];
			const isPublicPath = publicPaths.some(path => 
				router.pathname === path || router.pathname.startsWith('/movie')
			);
			
			// Check if current path is admin-only
			const isAdminPath = router.pathname.startsWith('/admin');
			
			// Check if it's a protected path that requires auth (ticket pages)
			const isProtectedPath = router.pathname.startsWith('/ticket');
			
			// If it's a public path, no need to check auth
			if (isPublicPath) {
				setIsAuthChecked(true);
				return;
			}
			
			// For admin paths or protected paths like ticket, check if user is authenticated
			if (isAdminPath || isProtectedPath) {
				const token = localStorage.getItem('auth_token');
				const userData = localStorage.getItem('user');
				
				// If no token or user data, redirect to login
				if (!token || !userData) {
					router.push('/login');
					return;
				}
				
				// Check if user is admin (only for admin paths)
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
			// On server side, don't block rendering
			setIsAuthChecked(true);
		}
	}, [router.pathname]);
	
	// Show a loading state while checking auth
	if (!isAuthChecked) {
		return <div className="loading-auth">Loading...</div>;
	}
	
	return <>{children}</>;
};

const App = ({ Component, pageProps }: AppProps) => {
	return (
		<Provider store={store}>
			<AuthStateHandler>
				<Component {...pageProps} />
			</AuthStateHandler>
		</Provider>
	);
};

export default App;
