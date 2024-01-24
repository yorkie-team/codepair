import { Box, Container, Divider, Grid, Paper, Stack, Typography } from "@mui/material";
import CodePairIcon from "../../components/icons/CodePairIcon";
import { GithubLoginButton } from "react-social-login-buttons";

const socialLoginList = [
	{
		SocailLoginComponent: GithubLoginButton,
		provider: "github",
	},
];

function LoginIndex() {
	const handleLogin = (provider: string) => {
		window.location.href = `${import.meta.env.VITE_API_ADDR}/auth/login/${provider}`;
	};

	return (
		<Container>
			<Stack alignItems="center" justifyContent="center" sx={{ height: "100vh" }}>
				<Paper sx={{ p: 5, width: "small", boxShadow: 2, maxWidth: "80%" }}>
					<Stack gap={4}>
						<Box>
							<Stack direction="row" gap={1}>
								<CodePairIcon />
								<Typography variant="h6">Login</Typography>
							</Stack>
							<Typography variant="body2" color="text.secondary" maxWidth={320}>
								Real-time markdown editor for interviews, meetings and more...
							</Typography>
						</Box>
						<Stack gap={2}>
							<Grid container spacing={1} alignItems="center">
								<Grid item xs>
									<Divider sx={{ width: 1 }} />
								</Grid>
								<Grid item xs="auto">
									<Typography variant="body2" color="text.secondary">
										Login with
									</Typography>
								</Grid>
								<Grid item xs>
									<Divider sx={{ width: 1 }} />
								</Grid>
							</Grid>
							{socialLoginList.map(({ SocailLoginComponent, provider }) => (
								<SocailLoginComponent
									key={provider}
									size="48px"
									onClick={() => handleLogin(provider)}
								/>
							))}
						</Stack>
					</Stack>
				</Paper>
			</Stack>
		</Container>
	);
}

export default LoginIndex;
