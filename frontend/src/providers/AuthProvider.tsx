import { ReactNode, useMemo } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useGetUserQuery } from "../hooks/api/user";
import ChangeNicknameModal from "../components/modals/ChangeNicknameModal";

interface AuthProviderProps {
	children?: ReactNode;
}

function AuthProvider(props: AuthProviderProps) {
	const { children } = props;
	const { data: user, isSuccess, isLoading } = useGetUserQuery();
	const shouldChangeNickname = useMemo(
		() => isSuccess && !user.nickname,
		[isSuccess, user?.nickname]
	);

	return (
		<AuthContext.Provider value={{ isLoggedIn: isSuccess, isLoading }}>
			{shouldChangeNickname ? <ChangeNicknameModal open /> : children}
		</AuthContext.Provider>
	);
}

export default AuthProvider;
