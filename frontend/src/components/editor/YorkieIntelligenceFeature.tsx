import {
	Box,
	Button,
	CircularProgress,
	FormControl,
	IconButton,
	InputAdornment,
	Stack,
	Typography,
	useTheme,
} from "@mui/material";
import { INTELLIGENCE_FOOTER_ID, IntelligenceFeature } from "../../constants/intelligence";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import SendIcon from "@mui/icons-material/Send";
import { useIntelligenceFeatureStream, useIntelligenceStream } from "../../hooks/api/intelligence";
import { useEffect, useMemo, useState } from "react";
import clipboard from "clipboardy";
import { useSnackbar } from "notistack";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { useCurrentTheme } from "../../hooks/useCurrentTheme";

interface YorkieIntelligenceFeatureProps {
	title: string;
	feature: IntelligenceFeature;
}

function YorkieIntelligenceFeature(props: YorkieIntelligenceFeatureProps) {
	const { title, feature } = props;
	const theme = useTheme();
	const currentTheme = useCurrentTheme();
	const {
		data: featureData,
		memoryKey,
		isLoading: isFeatureLoading,
		mutateAsync: mutateIntelligenceFeature,
	} = useIntelligenceFeatureStream(feature);
	const {
		data: followUpData,
		isLoading: isFollowUpLoading,
		mutateAsync: mutateIntelligence,
	} = useIntelligenceStream(memoryKey);
	const [content, setContent] = useState("");
	const intelligenceFooterPivot = document.getElementById(INTELLIGENCE_FOOTER_ID);
	const isLoading = useMemo(
		() => isFeatureLoading || isFollowUpLoading,
		[isFeatureLoading, isFollowUpLoading]
	);
	const data = useMemo(() => followUpData || featureData, [featureData, followUpData]);
	const { enqueueSnackbar } = useSnackbar();

	useEffect(() => {
		setContent(intelligenceFooterPivot?.getAttribute("content") ?? "");
	}, [intelligenceFooterPivot]);

	useEffect(() => {
		if (!content) return;

		mutateIntelligenceFeature(content);
	}, [content, mutateIntelligenceFeature]);

	const handleCopyContent = async () => {
		if (!data) return;

		await clipboard.write(data);
		enqueueSnackbar("URL Copied!", { variant: "success" });
	};

	const handleRetry = async () => {
		mutateIntelligence("Regenerate a response the last thing you said.");
	};

	return (
		<Stack gap={4}>
			<Box bgcolor={theme.palette.grey[200]} p={1} borderRadius={2}>
				<Typography>{title}</Typography>
			</Box>
			{isLoading && <CircularProgress sx={{ marginX: "auto" }} />}
			{!isLoading && (
				<MarkdownPreview
					source={data || ""}
					wrapperElement={{
						"data-color-mode": currentTheme,
					}}
				/>
			)}

			<Stack gap={2}>
				<Stack direction="row" justifyContent="flex-end" gap={1}>
					<Button variant="outlined" onClick={handleRetry}>
						<RefreshIcon fontSize="small" />
					</Button>
					<Button variant="outlined" onClick={handleCopyContent}>
						<ContentCopyIcon fontSize="small" />
					</Button>
					<Button variant="outlined">Insert below</Button>
					<Button variant="contained">Replace</Button>
				</Stack>
				<FormControl>
					<FormContainer
						defaultValues={{ content: "" }}
						onSuccess={(data) => mutateIntelligence(data.content)}
					>
						<Stack gap={4} alignItems="flex-end">
							<TextFieldElement
								variant="outlined"
								name="content"
								placeholder={"Tell Yorkie what to do next"}
								required
								fullWidth
								size="small"
								multiline
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<img src="/public/yorkie.png" height={20} />
										</InputAdornment>
									),
									endAdornment: (
										<InputAdornment position="end">
											<IconButton type="submit" edge="end">
												<SendIcon />
											</IconButton>
										</InputAdornment>
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
