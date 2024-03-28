import { Box, Button, Container, Flex } from "yorkie-ui";
import CodePairIcon from "../icons/CodePairIcon";
import { useNavigate } from "react-router-dom";

function MainHeader() {
	const navigate = useNavigate();

	const handleMoveToLogin = () => {
		navigate("/login");
	};

	return (
		<Box pos="static" borderWidth="1px" borderColor="border.default" py="6" zIndex="100">
			<Container>
				<Flex alignItems="center" justifyContent="space-between">
					<CodePairIcon />
					<Button onClick={handleMoveToLogin}>Login</Button>
				</Flex>
			</Container>
		</Box>
	);
}

export default MainHeader;
