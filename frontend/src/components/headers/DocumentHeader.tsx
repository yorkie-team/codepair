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
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useUserPresence } from "../../hooks/useUserPresence";
import { EditorModeType, selectEditor, setMode } from "../../store/editorSlice";
import { selectWorkspace } from "../../store/workspaceSlice";
import DownloadMenu from "../common/DownloadMenu";
import ShareButton from "../common/ShareButton";
import ThemeButton from "../common/ThemeButton";
import UserPresenceList from "./UserPresenceList";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import { useGetWorkspaceQuery } from "../../hooks/api/workspace";

import {
	useUpdateDocumentTitleMutation,
	useGetDocumentQuery,
} from "../../hooks/api/workspaceDocument";

function DocumentHeader() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const editorState = useSelector(selectEditor);
	const workspaceState = useSelector(selectWorkspace);
	const { presenceList } = useUserPresence(editorState.doc);
	const [focused, setFocused] = useState(false);
	const [documentTitle, setDocumentTitle] = useState("");
	const params = useParams();
	const { data: workspace } = useGetWorkspaceQuery(params.workspaceSlug);

	const { data: documentData } = useGetDocumentQuery(
		workspace?.id || "",
		params.documentId || ""
	);

	const { mutateAsync: updateDocumentTitle } = useUpdateDocumentTitleMutation(
		workspace?.id || "",
		params.documentId || ""
	);

	const handleFocus = () => {
		setFocused(true);
	};

	useEffect(() => {
		if (editorState.shareRole === "READ") {
			dispatch(setMode("read"));
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
		setDocumentTitle(e.target.value);
	};

	const handleUpdateDocumentTitle = async (data: { title: string }) => {
		await updateDocumentTitle(data);
		setFocused(false);
	};

	useEffect(() => {
		if (documentData && documentData.title) {
			setDocumentTitle(documentData.title);
		}
	}, [documentData]);

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
							{editorState.shareRole !== "READ" && (
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
							<FormControl>
								<FormContainer
									defaultValues={{ title: documentTitle }}
									onSuccess={handleUpdateDocumentTitle}
								>
									<Stack gap={4} alignItems="flex-end" flexDirection="row">
										<TextFieldElement
											variant="standard"
											name="title"
											label={documentTitle}
											required
											fullWidth
											inputProps={{
												maxLength: 255,
											}}
											onChange={handleDocumentTitleChange}
											onFocus={handleFocus}
										/>
										{focused && (
											<Button type="submit" variant="contained" size="large">
												Update
											</Button>
										)}
									</Stack>
								</FormContainer>
							</FormControl>
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
