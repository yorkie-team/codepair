import React from "react";

export interface AuthContextValue {
	isLoading: boolean;
	isLoggedIn: boolean;
}

export const AuthContext = React.createContext<AuthContextValue>({
	isLoading: true,
	isLoggedIn: false,
});
