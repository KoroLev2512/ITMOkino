import classNames from "classnames";
import React from "react";
import styles from "./styles.module.scss";

type TextOwnProps<C extends React.ElementType = "p"> = {
	as?: C;
	children: React.ReactNode;
	className?: string;
	center?: boolean;
};

type TextProps<C extends React.ElementType> = TextOwnProps<C> &
	Omit<React.ComponentPropsWithoutRef<C>, keyof TextOwnProps>;

export const Text = <C extends React.ElementType = "p">({
															as,
															children,
															className,
															center,
															...rest
														}: TextProps<C>) => {
	const Component = as || "p";

	return (
		<Component
			className={classNames(styles.text, className, {
				[styles.center]: center,
			})}
			{...rest}
		>
			{children}
		</Component>
	);
};