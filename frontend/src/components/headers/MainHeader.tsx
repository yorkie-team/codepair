import { AppBar, Stack, Toolbar } from "@mui/material";

import ThemeButton from "../common/ThemeButton";
import CodePairIcon from "../icons/CodePairIcon";
function MainHeader() {
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
					<ThemeButton />
				</Stack>
			</Toolbar>
		</AppBar>
	);
}

export default MainHeader;
