import { ReactNode, useMemo } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useGetUserQuery } from "../hooks/api/user";
import ChangeNicknameModal from "../components/modals/ChangeNicknameModal";

interface AuthProviderProps {
	children?: ReactNode;
}

function AuthProvider(props: AuthProviderProps) {
	const { children } = props;
	const { data: user, isSuccess, isLoading, isPending } = useGetUserQuery();
	const shouldChangeNickname = useMemo(
		() => isSuccess && !user.nickname,
		[isSuccess, user?.nickname]
	);
	const isAuthLoading = isLoading || isPending;

	return (
		<AuthContext.Provider value={{ isLoggedIn: isSuccess, isLoading: isAuthLoading }}>
			{shouldChangeNickname ? <ChangeNicknameModal open /> : children}
		</AuthContext.Provider>
	);
}

export default AuthProvider;
