import { Stack, Text } from "yorkie-ui";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

function CodePairError() {
	const error = useRouteError();

	return (
		<Stack
			alignItems="center"
			justifyContent="center"
			style={{
				height: "100vh",
			}}
		>
			<Stack alignItems="center">
				<Text>Something went wrong</Text>
				{isRouteErrorResponse(error) && <Text>Status Code: {error.status}</Text>}
			</Stack>
		</Stack>
	);
}

export default CodePairError;
