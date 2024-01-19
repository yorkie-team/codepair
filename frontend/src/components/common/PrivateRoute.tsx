import { ReactNode, useContext } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { Backdrop, CircularProgress } from "@mui/material";

interface PrivateRouteProps {
	children?: ReactNode;
}

const PrivateRoute = (props: PrivateRouteProps) => {
	const { children } = props;
	const { isLoggedIn, isLoading } = useContext(AuthContext);
	const location = useLocation();

	if (isLoading) {
		return (
			<Backdrop open>
				<CircularProgress color="inherit" />
			</Backdrop>
		);
	}

	if (!isLoggedIn) {
		return <Navigate to="/" state={{ from: location }} replace />;
	}

	return children;
};

export default PrivateRoute;
