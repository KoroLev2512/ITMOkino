import React from "react";
import styles from "./styles.module.scss";
import {useAppStore} from "@/shared/store/appStore";

function ColorMode() {
	const isDarkMode = useAppStore(state => state.isDarkMode);
	const toggleDarkMode = useAppStore(state => state.toggleDarkMode);

	const handleToggleDarkMode = () => {
		toggleDarkMode(!isDarkMode);
	};

	return (
		<div className={styles.toggleWrapper}>
			<input type="checkbox" id="theme-toggle" checked={isDarkMode} onClick={handleToggleDarkMode}/>
			<label htmlFor="theme-toggle" className={styles.toggle}>
				<span className={styles.toggleRay}>
					<span className={styles.ray}></span>
					<span className={styles.ray}></span>
					<span className={styles.ray}></span>
				</span>
				<span className={styles.toggleItems}>
					<span className={styles.glare}></span>
					<span className={styles.dot}></span>
					<span className={styles.dot}></span>
					<span className={styles.dot}></span>
				</span>
			</label>
		</div>
	);
}

export default ColorMode;
