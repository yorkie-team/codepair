import { ReactNode, useContext } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

interface RejectLoggedInRouteProps {
	children?: ReactNode;
}

const GuestRoute = (props: RejectLoggedInRouteProps) => {
	const { children } = props;
	const { isLoggedIn } = useContext(AuthContext);
	const location = useLocation();

	if (isLoggedIn) {
		return <Navigate to="/workspace" state={{ from: location }} replace />;
	}

	return children;
};

export default GuestRoute;
