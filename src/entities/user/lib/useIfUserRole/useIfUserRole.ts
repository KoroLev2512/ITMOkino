import { useEffect, useState } from "react";
import { ROLES } from "@/entities/user/types/userState";
import { useUserStore } from "@/entities/user/model/slice/userStore";

export const useIfUserRole = () => {
	const user = useUserStore((state) => state.user);
	const [roles, setRoles] = useState<{ id: number; value: string; description: string }[]>([]);

	useEffect(() => {
		if (user && user.roles) {
			setRoles(user.roles);
		} else {
			setRoles([{ id: 0, value: ROLES.GUEST, description: "Guest user" }]);
		}
	}, [user]);

	return {
		isUser: roles.some((item) => item.value === ROLES.USER) || false,
		isAdmin: roles.some((item) => item.value === ROLES.ADMIN) || false,
		isGuest: roles.some((item) => item.value === ROLES.GUEST) || false,
	};
};