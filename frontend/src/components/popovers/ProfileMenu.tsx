import { useDispatch, useSelector } from "react-redux";
import { setAccessToken } from "../../store/authSlice";
import { selectUser, setUserData } from "../../store/userSlice";
import { Menu, Button, Flex, Avatar } from "yorkie-ui";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import LogoutIcon from "@mui/icons-material/Logout";

function ProfilePopover() {
	const dispatch = useDispatch();
	const userStore = useSelector(selectUser);

	const handleLogout = () => {
		dispatch(setAccessToken(null));
		dispatch(setUserData(null));
	};

	return (
		<Menu.Root>
			<Menu.Trigger w="full">
				<Button variant="ghost" w="full">
					<Flex alignItems="center" w="full" justifyContent="space-between">
						<Flex alignItems="center" gap="4">
							<Avatar name={userStore.data?.nickname?.charAt(0)} />
							{userStore.data?.nickname}
						</Flex>
						<MoreVertIcon />
					</Flex>
				</Button>
			</Menu.Trigger>
			<Menu.Positioner>
				<Menu.Content>
					<Menu.Item id="logout" onClick={handleLogout}>
						<LogoutIcon fontSize="small" />
						Logout
					</Menu.Item>
				</Menu.Content>
			</Menu.Positioner>
		</Menu.Root>
	);
}

export default ProfilePopover;
