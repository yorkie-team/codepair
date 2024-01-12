import {
	AppBar,
	IconButton,
	Paper,
	Stack,
	ToggleButton,
	ToggleButtonGroup,
	Toolbar,
	Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VerticalSplitIcon from "@mui/icons-material/VerticalSplit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import { useDispatch, useSelector } from "react-redux";
import { EditorModeType, selectEditor, setMode } from "../../store/editorSlice";
import ThemeButton from "../common/ThemeButton";

function EditorHeader() {
	const dispatch = useDispatch();
	const editorState = useSelector(selectEditor);

	const handleChangeMode = (newMode: EditorModeType) => {
		dispatch(setMode(newMode));
	};

	return (
		<AppBar position="static" sx={{ zIndex: 100 }}>
			<Toolbar>
				<Stack width="100%" direction="row" justifyContent="space-between">
					<Stack direction="row" spacing={1}>
						<Paper>
							<ToggleButtonGroup
								value={editorState.mode}
								exclusive
								onChange={(_, newMode) => handleChangeMode(newMode)}
								size="small"
							>
								<ToggleButton value="edit" aria-label="edit">
									<Tooltip title="Edit Mode">
										<EditIcon />
									</Tooltip>
								</ToggleButton>
								<ToggleButton value="both" aria-label="both">
									<Tooltip title="Both Mode">
										<VerticalSplitIcon />
									</Tooltip>
								</ToggleButton>
								<ToggleButton value="read" aria-label="read">
									<Tooltip title="Read Mode">
										<VisibilityIcon />
									</Tooltip>
								</ToggleButton>
							</ToggleButtonGroup>
						</Paper>
						<Tooltip title="Create New Note">
							<IconButton color="inherit">
								<AddIcon />
							</IconButton>
						</Tooltip>
					</Stack>
					<ThemeButton />
				</Stack>
			</Toolbar>
		</AppBar>
	);
}

export default EditorHeader;
