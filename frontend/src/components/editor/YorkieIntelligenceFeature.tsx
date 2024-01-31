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
import { useIntelligenceFeatureStream } from "../../hooks/api/intelligence";
import { useEffect, useState } from "react";

interface YorkieIntelligenceFeatureProps {
	title: string;
	feature: IntelligenceFeature;
}

function YorkieIntelligenceFeature(props: YorkieIntelligenceFeatureProps) {
	const { title, feature } = props;
	const theme = useTheme();
	const { data, memoryKey, isLoading, mutateAsync } = useIntelligenceFeatureStream(feature);
	const [content, setContent] = useState("");
	const intelligenceFooterPivot = document.getElementById(INTELLIGENCE_FOOTER_ID);

	useEffect(() => {
		setContent(intelligenceFooterPivot?.getAttribute("content") ?? "");
	}, [intelligenceFooterPivot]);

	useEffect(() => {
		if (!content) return;

		mutateAsync(content);
	}, [content, mutateAsync]);

	return (
		<Stack gap={4}>
			<Box bgcolor={theme.palette.grey[200]} p={1} borderRadius={2}>
				<Typography>{title}</Typography>
			</Box>
			{isLoading && <CircularProgress sx={{ marginX: "auto" }} />}
			{!isLoading && <Typography>{data}</Typography>}
			<Stack gap={2}>
				<Stack direction="row" justifyContent="flex-end" gap={1}>
					<Button variant="outlined">
						<RefreshIcon fontSize="small" />
					</Button>
					<Button variant="outlined">
						<ContentCopyIcon fontSize="small" />
					</Button>
					<Button variant="outlined">Insert below</Button>
					<Button variant="contained">Replace</Button>
				</Stack>
				<FormControl>
					<FormContainer
						defaultValues={{ content: "" }}
						// onSuccess={handleCreate}
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
