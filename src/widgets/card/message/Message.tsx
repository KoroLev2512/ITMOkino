import React from "react";
import { MovieCard } from "../MovieCard";
import styles from "./styles.module.scss";

export type MessageProps = {
  title: string;
  description: string;
  image?: React.ReactNode;
};

export const Message = (props: MessageProps) => {
	return <MovieCard {...props} className={styles.message} />;
};
