import { Backdrop, CircularProgress } from "@mui/material";
import { useNavigate, useParams } from "react-router";
import { useJoinWorkspaceMutation } from "../../../hooks/api/workspace";
import { useEffect } from "react";

function JoinIndex() {
	const params = useParams();
	const navigate = useNavigate();
	const { mutateAsync: joinWorkspace } = useJoinWorkspaceMutation();

	useEffect(() => {
		if (!params.invitationToken) return;

		joinWorkspace({ invitationToken: params.invitationToken }).then((data) => {
			navigate(`/workspace/${data.slug}`);
		});
	}, [joinWorkspace, navigate, params.invitationToken]);

	return (
		<Backdrop open>
			<CircularProgress color="inherit" />
		</Backdrop>
	);
}

export default JoinIndex;
