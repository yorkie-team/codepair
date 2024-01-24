import { ReactNode, useContext } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/userSlice";

interface RejectLoggedInRouteProps {
	children?: ReactNode;
}

const GuestRoute = (props: RejectLoggedInRouteProps) => {
	const { children } = props;
	const { isLoggedIn } = useContext(AuthContext);
	const location = useLocation();
	const userStore = useSelector(selectUser);

	if (isLoggedIn) {
		return (
			<Navigate
				to={`/${userStore.data?.lastWorkspaceSlug}`}
				state={{ from: location }}
				replace
			/>
		);
	}

	return children;
};

export default GuestRoute;
