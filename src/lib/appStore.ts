import {create} from "zustand";
import {devtools} from "zustand/middleware";
import {immer} from "zustand/middleware/immer";
import {AppState} from "./types/dto/app.dto";
import {setCookie} from "nookies";
// import {isUndefined} from "lodash";

export const useAppStore = create<AppState>()(devtools(immer((set) => {
	return ({
		isLoading: false,
		isDarkMode: false,
		toggleDarkMode: (value: boolean) => {
			setCookie(null, "theme", value ? "dark" : "light", {
				path: "/"
			});
			set({isDarkMode: value});
		},
		// toggleMenuPage: (value) => {
		// 	set((state) => {
		// 		return ({menuPageIsOpen: !isUndefined(value) ? value :  !state.menuPageIsOpen});
		// 	});
		// },
	});
})));
