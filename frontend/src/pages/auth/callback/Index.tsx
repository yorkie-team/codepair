import { Box } from "yorkie-ui";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setAccessToken } from "../../../store/authSlice";

function CallbackIndex() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	useEffect(() => {
		const token = searchParams.get("token");

		if (!token) {
			navigate("/");
			return;
		}

		dispatch(setAccessToken(token));
	}, [dispatch, navigate, searchParams]);

	return <Box></Box>;
}

export default CallbackIndex;
