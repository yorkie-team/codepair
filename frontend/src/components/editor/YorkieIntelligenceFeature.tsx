import {
	Box,
	Button,
	CircularProgress,
	Fade,
	FormControl,
	IconButton,
	InputAdornment,
	Stack,
	Typography,
	useTheme,
} from "@mui/material";
import { INTELLIGENCE_FOOTER_ID } from "../../constants/intelligence";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import { FormContainer, TextFieldElement, useForm } from "react-hook-form-mui";
import SendIcon from "@mui/icons-material/Send";
import { useIntelligenceFeatureStream, useIntelligenceStream } from "../../hooks/api/intelligence";
import { useEffect, useMemo, useRef, useState } from "react";
import clipboard from "clipboardy";
import { useSnackbar } from "notistack";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { useCurrentTheme } from "../../hooks/useCurrentTheme";
import { addSoftLineBreak } from "../../utils/document";
import { useSelector } from "react-redux";
import { selectEditor } from "../../store/editorSlice";

interface YorkieIntelligenceFeatureProps {
	title: string;
	feature: string;
	onClose: () => void;
}

function YorkieIntelligenceFeature(props: YorkieIntelligenceFeatureProps) {
	const { title, feature, onClose } = props;
	const theme = useTheme();
	const currentTheme = useCurrentTheme();
	const editorStore = useSelector(selectEditor);
	const {
		data: featureData,
		memoryKey,
		isLoading: isFeatureLoading,
		isComplete: isFeatureComplete,
		mutateAsync: mutateIntelligenceFeature,
	} = useIntelligenceFeatureStream(feature);
	const {
		data: followUpData,
		isLoading: isFollowUpLoading,
		isComplete: isFollowUpComplete,
		mutateAsync: mutateIntelligence,
	} = useIntelligenceStream(memoryKey);
	const [content, setContent] = useState("");
	const intelligenceFooterPivot = document.getElementById(INTELLIGENCE_FOOTER_ID);
	const isLoading = useMemo(
		() => isFeatureLoading || isFollowUpLoading,
		[isFeatureLoading, isFollowUpLoading]
	);
	const isComplete = useMemo(
		() => isFeatureComplete || isFollowUpComplete,
		[isFeatureComplete, isFollowUpComplete]
	);
	const data = useMemo(() => followUpData || featureData, [featureData, followUpData]);
	const { enqueueSnackbar } = useSnackbar();
	const markdownPreviewRef = useRef<HTMLElement>(null);
	const formContext = useForm<{ content: string }>();
	const { reset, formState } = formContext;

	useEffect(() => {
		if (formState.isSubmitSuccessful) {
			reset({ content: "" });
		}
	}, [formState.isSubmitSuccessful, reset]);

	useEffect(() => {
		setContent(intelligenceFooterPivot?.getAttribute("content") ?? "");
	}, [intelligenceFooterPivot]);

	useEffect(() => {
		if (!content) return;

		mutateIntelligenceFeature(content);
	}, [content, mutateIntelligenceFeature]);

	useEffect(() => {
		if (data && markdownPreviewRef.current) {
			markdownPreviewRef.current.scrollTo({
				behavior: "smooth",
				top: markdownPreviewRef.current.scrollHeight,
			});
		}
	}, [data]);

	const handleCopyContent = async () => {
		if (!data) return;

		await clipboard.write(data);
		enqueueSnackbar("URL Copied!", { variant: "success" });
	};

	const handleRetry = async () => {
		mutateIntelligence(
			"Recreate the last statement with a paraphrase or adjust it slightly to better suit the user's input."
		);
	};

	const handleRequestSubmit = (data: { content: string }) => {
		mutateIntelligence(data.content);
	};

	const handleAddContent = (replace: boolean = false) => {
		if (!editorStore.cmView) return;
		const selection = editorStore.cmView.state.selection.main;
		let from = Math.min(selection.to, selection.from);
		const to = Math.max(selection.to, selection.from);
		let insert = data as string;

		if (!replace) {
			from = to;
			insert = `\n${insert}`;
		}

		const selectionFrom = replace ? from : from + 1;
		const selectionTo = from + insert.length;

		editorStore.doc?.update((root, presence) => {
			root.content.edit(from, to, insert);
			presence.set({
				selection: root.content.indexRangeToPosRange([selectionFrom, selectionTo]),
			});
		});
		editorStore.cmView?.dispatch({
			changes: { from, to, insert },
			selection: {
				anchor: selectionFrom,
				head: selectionTo,
			},
		});
		onClose();
	};

	return (
		<Stack gap={4}>
			<Box bgcolor={theme.palette.background.paper} p={1} borderRadius={2} border={1}>
				<Typography>{title}</Typography>
			</Box>
			{isLoading && <CircularProgress sx={{ marginX: "auto" }} />}
			<Box ref={markdownPreviewRef} sx={{ height: 350, overflow: "auto" }}>
				{!isLoading && (
					<MarkdownPreview
						source={addSoftLineBreak(data || "")}
						wrapperElement={{
							"data-color-mode": currentTheme,
						}}
					/>
				)}
			</Box>

			<Stack gap={2}>
				<Fade in={isComplete}>
					<Stack direction="row" justifyContent="flex-end" gap={1}>
						<Button variant="outlined" onClick={handleRetry}>
							<RefreshIcon fontSize="small" />
						</Button>
						<Button variant="outlined" onClick={handleCopyContent}>
							<ContentCopyIcon fontSize="small" />
						</Button>
						<Button variant="outlined" onClick={() => handleAddContent()}>
							Insert below
						</Button>
						<Button variant="contained" onClick={() => handleAddContent(true)}>
							Replace
						</Button>
					</Stack>
				</Fade>
				<FormControl>
					<FormContainer
						defaultValues={{ content: "" }}
						formContext={formContext}
						onSuccess={handleRequestSubmit}
					>
						<Stack gap={4} alignItems="flex-end">
							<TextFieldElement
								variant="outlined"
								name="content"
								placeholder={"Tell Yorkie what to do next"}
								required
								fullWidth
								disabled={!isComplete}
								size="small"
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<img src="/yorkie.png" height={20} />
										</InputAdornment>
									),
									endAdornment: (
										<Fade in={isComplete}>
											<InputAdornment position="end">
												<IconButton type="submit" edge="end">
													<SendIcon />
												</IconButton>
											</InputAdornment>
										</Fade>
									),
								}}
							/>
						</Stack>
					</FormContainer>
				</FormControl>
			</Stack>
		</Stack>
	);
}

export default YorkieIntelligenceFeature;
