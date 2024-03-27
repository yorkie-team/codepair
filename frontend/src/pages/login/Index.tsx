import { Box, Container, Grid, GridItem, Stack, Text, Card, Flex } from "yorkie-ui";
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
		<Container h="100%">
			<Stack alignItems="center" justifyContent="center" h="100%">
				<Card.Root width="xs">
					<Card.Header>
						<Card.Title>
							<Flex gap="2">
								<CodePairIcon />
								CodePair
							</Flex>
						</Card.Title>
						<Card.Description>
							Real-time markdown editor for interviews, meetings and more...
						</Card.Description>
					</Card.Header>
					<Card.Body>
						{socialLoginList.map(({ SocailLoginComponent, provider }) => (
							<SocailLoginComponent
								key={provider}
								size="48px"
								onClick={() => handleLogin(provider)}
							/>
						))}
					</Card.Body>
				</Card.Root>
			</Stack>
		</Container>
	);
}

export default LoginIndex;
