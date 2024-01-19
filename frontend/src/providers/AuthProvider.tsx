import { ReactNode, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useGetUserQuery } from "../hooks/api/user";

interface AuthProviderProps {
	children?: ReactNode;
}

function AuthProvider(props: AuthProviderProps) {
	const { children } = props;
	const { isSuccess } = useGetUserQuery();
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	useEffect(() => {
		setIsLoggedIn(isSuccess);
	}, [isSuccess]);

	return <AuthContext.Provider value={{ isLoggedIn }}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
