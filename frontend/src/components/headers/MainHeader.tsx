import { AppBar, Button, Stack, Toolbar } from "@mui/material";

import ThemeButton from "../common/ThemeButton";
import CodePairIcon from "../icons/CodePairIcon";
import { useNavigate } from "react-router-dom";
function MainHeader() {
	const navigate = useNavigate();

	const handleMoveToLogin = () => {
		navigate("/login");
	};

	return (
		<AppBar position="static" sx={{ zIndex: 100 }}>
			<Toolbar>
				<Stack
					width="100%"
					direction="row"
					justifyContent="space-between"
					alignItems="center"
				>
					<CodePairIcon />
					<Stack direction="row" alignItems="center" gap={2}>
						<Button color="inherit" onClick={handleMoveToLogin}>
							Login
						</Button>
						<ThemeButton />
					</Stack>
				</Stack>
			</Toolbar>
		</AppBar>
	);
}

export default MainHeader;
