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

import React from "react";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { store } from "@/shared/store/store";
import "@/app/styles/globals.scss";

const App = ({ Component, pageProps }: AppProps) => {
	return (
		<Provider store={store}>
			<Component {...pageProps} />
		</Provider>
	);
};

export default App;
