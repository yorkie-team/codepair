import { CircularProgress } from "@mui/material";
import { useNavigate, useParams } from "react-router";
import { useJoinWorkspaceMutation } from "../../../hooks/api/workspace";
import { useEffect } from "react";
import { Dialog } from "yorkie-ui";

function JoinIndex() {
	const params = useParams();
	const navigate = useNavigate();
	const { mutateAsync: joinWorkspace } = useJoinWorkspaceMutation();

	useEffect(() => {
		if (!params.invitationToken) return;

		joinWorkspace({ invitationToken: params.invitationToken }).then((data) => {
			navigate(`/${data.slug}`);
		});
	}, [joinWorkspace, navigate, params.invitationToken]);

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

export default JoinIndex;
