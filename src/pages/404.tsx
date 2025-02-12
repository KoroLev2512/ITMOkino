import Image from "next/image";
import React from "react";
import {Message, MessageProps} from "@/widgets/card/message";
import ErrorIcon from "../../public/icons/error-icon.svg";

const notFoundMessage: MessageProps = {
	description: "Кажется, эта страничка отправилась на мероприятие и не вернулась",
	title: "Упс! Что-то пошло не так...",
	image: (
		<Image
			src={ErrorIcon}
			height="100"
			width="100"
			alt="work in progress"
			style={{marginBottom:10}}
		/>
	),
};

const NotFoundPage = () => {
	return (
		<div>
			{/*<Logotype />*/}
			<Message {...notFoundMessage} />
		</div>
	);
};

export default NotFoundPage;
