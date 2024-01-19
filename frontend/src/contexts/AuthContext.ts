import React from "react";

export interface AuthContextValue {
	isLoggedIn: boolean;
}

export const AuthContext = React.createContext<AuthContextValue>({
	isLoggedIn: false,
});
