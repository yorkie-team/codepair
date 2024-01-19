import { ReactNode } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useGetUserQuery } from "../hooks/api/user";

interface AuthProviderProps {
	children?: ReactNode;
}

function AuthProvider(props: AuthProviderProps) {
	const { children } = props;
	const { isSuccess, isLoading } = useGetUserQuery();

	return (
		<AuthContext.Provider value={{ isLoggedIn: isSuccess, isLoading }}>
			{children}
		</AuthContext.Provider>
	);
}

export default AuthProvider;
