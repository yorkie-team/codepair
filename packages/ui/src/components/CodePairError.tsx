import { Stack, Typography } from "@mui/material";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

function CodePairError() {
	const error = useRouteError();

	return (
		<Stack width={1} height="100vh" alignItems="center" justifyContent="center">
			<Stack alignItems="center">
				<Typography variant="h5">Something went wrong</Typography>
				{isRouteErrorResponse(error) && (
					<Typography variant="subtitle1">Status Code: {error.status}</Typography>
				)}
			</Stack>
		</Stack>
	);
}

export default CodePairError;
