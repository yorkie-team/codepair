import { Box } from "@mui/material";
import { useSearchParams } from "react-router-dom";

function CallbackIndex() {
	const [searchParams] = useSearchParams();

	console.log(searchParams.get("token"));

	return <Box></Box>;
}

export default CallbackIndex;
