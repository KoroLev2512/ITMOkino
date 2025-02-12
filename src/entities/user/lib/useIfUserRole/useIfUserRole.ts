import { ROLES } from "@/entities/user/types/userState";
import { isEmpty, isNull } from "lodash";
import { useUserStore } from "@/entities/user/model/slice/userStore";

export const useIfUserRole = () => {
	const user = useUserStore(state => state.user);
	if (isNull(user) || isEmpty(user.roles)) {
		return {
			isUser: false,
			isAdmin: false,
			isGuest: false,
		};
	}

	const roles = user.roles || [];

	return {
		isUser: roles.some(item => item.value === ROLES.USER) || false,
		isAdmin: roles.some(item => item.value === ROLES.ADMIN) || false,
		isGuest: roles.some(item => item.value === ROLES.GUEST) || false,
	};
};