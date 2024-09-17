import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import EditIcon from "@mui/icons-material/Edit";
import VerticalSplitIcon from "@mui/icons-material/VerticalSplit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
	AppBar,
	IconButton,
	Paper,
	Stack,
	ToggleButton,
	ToggleButtonGroup,
	Toolbar,
	Tooltip,
	Button,
	FormControl,
	Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useUserPresence } from "../../hooks/useUserPresence";
import { EditorModeType, selectEditor, setMode } from "../../store/editorSlice";
import { selectWorkspace } from "../../store/workspaceSlice";
import { ShareRole } from "../../utils/share";
import DownloadMenu from "../common/DownloadMenu";
import ShareButton from "../common/ShareButton";
import ThemeButton from "../common/ThemeButton";
import UserPresenceList from "./UserPresenceList";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import { selectDocument, setDocumentData } from "../../store/documentSlice";
import { useUpdateDocumentTitleMutation } from "../../hooks/api/workspaceDocument";
import { UpdateDocumentRequest } from "../../hooks/api/types/document";

function DocumentHeader() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const editorState = useSelector(selectEditor);
	const workspaceState = useSelector(selectWorkspace);
	const documentStore = useSelector(selectDocument);
	const { presenceList } = useUserPresence(editorState.doc);
	const [focused, setFocused] = useState(false);
	const { mutateAsync: updateDocumentTitle } = useUpdateDocumentTitleMutation(
		workspaceState.data?.id || "",
		documentStore.data?.id || ""
	);

	const isEditingDisabled = editorState.shareRole === "READ";

	const handleFocus = () => {
		setFocused(true);
	};

	useEffect(() => {
		if (editorState.shareRole === ShareRole.READ) {
			dispatch(setMode(EditorModeType.READ));
		}
	}, [dispatch, editorState.shareRole]);

	const handleChangeMode = (newMode: EditorModeType) => {
		if (!newMode) return;
		dispatch(setMode(newMode));
	};

	const handleToPrevious = () => {
		navigate(`/${workspaceState.data?.slug}`);
	};

	const handleDocumentTitleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		if (documentStore.data) {
			dispatch(
				setDocumentData({
					...documentStore.data,
					title: e.target.value,
				})
			);
		}
	};

	const handleUpdateDocumentTitle = async (data: UpdateDocumentRequest) => {
		console.log(data);
		await updateDocumentTitle(data);
		setFocused(false);
	};

	const validationRules = {
		required: "Title is required",
		maxLength: {
			value: 255,
			message: "Title must be less than 255 characters",
		},
		validate: {
			notEmpty: (value: string) => value.trim() !== "" || "Title cannot be just whitespace",
		},
	};

	return (
		<AppBar position="static" sx={{ zIndex: 100 }}>
			<Toolbar>
				<Stack width="100%" direction="row" justifyContent="space-between">
					<Stack direction="row" spacing={1} alignItems="center">
						{!editorState.shareRole && (
							<Tooltip title="Back to Previous Page">
								<IconButton color="inherit" onClick={handleToPrevious}>
									<ArrowBackIosNewIcon />
								</IconButton>
							</Tooltip>
						)}
						<Paper>
							{editorState.shareRole !== ShareRole.READ && (
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
							)}
						</Paper>
						<DownloadMenu />
						<Stack alignItems="center">
							{isEditingDisabled ? (
								<Typography variant="h5">{documentStore.data?.title}</Typography>
							) : (
								<FormControl>
									<FormContainer
										defaultValues={{ title: documentStore.data?.title }}
										onSuccess={handleUpdateDocumentTitle}
									>
										<Stack gap={4} alignItems="flex-end" flexDirection="row">
											<TextFieldElement
												variant="standard"
												name="title"
												label={documentStore.data?.title}
												required
												fullWidth
												inputProps={{
													maxLength: 255,
												}}
												onChange={handleDocumentTitleChange}
												onFocus={handleFocus}
												rules={validationRules}
												helperText={
													focused ? "Please provide a valid title." : ""
												}
											/>
											{focused && (
												<Button
													type="submit"
													variant="contained"
													size="large"
												>
													Update
												</Button>
											)}
										</Stack>
									</FormContainer>
								</FormControl>
							)}
						</Stack>
					</Stack>

					<Stack direction="row" alignItems="center" gap={1}>
						<UserPresenceList presenceList={presenceList} />
						{!editorState.shareRole && <ShareButton />}
						<ThemeButton />
					</Stack>
				</Stack>
			</Toolbar>
		</AppBar>
	);
}

export default DocumentHeader;
