import { ReactNode, useContext } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { CircularProgress } from "@mui/material";
import { Dialog } from "yorkie-ui";

interface PrivateRouteProps {
	children?: ReactNode;
}

const PrivateRoute = (props: PrivateRouteProps) => {
	const { children } = props;
	const { isLoggedIn, isLoading } = useContext(AuthContext);
	const location = useLocation();

	if (isLoading) {
		return (
			<Dialog.Root open>
				<Dialog.Backdrop>
					<Dialog.Positioner>
						<CircularProgress color="inherit" />
					</Dialog.Positioner>
				</Dialog.Backdrop>
			</Dialog.Root>
		);
	}

	if (!isLoggedIn) {
		return <Navigate to="/" state={{ from: location }} replace />;
	}

	return children;
};

export default PrivateRoute;
