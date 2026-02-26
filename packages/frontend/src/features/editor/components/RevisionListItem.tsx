import {
	ListItem,
	ListItemButton,
	ListItemText,
	Typography,
	Box,
	Chip,
	IconButton,
	Tooltip,
	Stack,
} from "@mui/material";
import { Restore as RestoreIcon, Visibility as VisibilityIcon } from "@mui/icons-material";
import moment from "moment";
import type { RevisionSummary } from "@yorkie-js/sdk";

interface RevisionListItemProps {
	revision: RevisionSummary;
	onRestore: (id: string, label: string) => void;
	onPreview?: (revision: RevisionSummary) => void;
}

function RevisionListItem({ revision, onRestore, onPreview }: RevisionListItemProps) {
	return (
		<ListItem
			secondaryAction={
				<Stack direction="row" spacing={1}>
					{onPreview && (
						<Tooltip title="Preview">
							<IconButton edge="end" onClick={() => onPreview(revision)} size="small">
								<VisibilityIcon fontSize="small" />
							</IconButton>
						</Tooltip>
					)}
					<Tooltip title="Restore to this revision">
						<IconButton
							edge="end"
							onClick={() => onRestore(revision.id, revision.label)}
							size="small"
						>
							<RestoreIcon fontSize="small" />
						</IconButton>
					</Tooltip>
				</Stack>
			}
			disablePadding
		>
			<ListItemButton sx={{ pr: { xs: 8, sm: 10 }, pl: { xs: 1, sm: 2 } }}>
				<ListItemText
					primary={
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: { xs: 0.5, sm: 1 },
								mb: 0.5,
								flexWrap: "wrap",
							}}
						>
							<Typography
								variant="subtitle2"
								fontWeight="bold"
								sx={{
									fontSize: { xs: "0.813rem", sm: "0.875rem" },
									wordBreak: "break-word",
								}}
							>
								{revision.label}
							</Typography>
							<Chip
								label={moment(revision.createdAt).fromNow()}
								size="small"
								variant="outlined"
								sx={{ fontSize: { xs: "0.688rem", sm: "0.75rem" } }}
							/>
						</Box>
					}
					secondary={
						<Box>
							<Typography
								variant="body2"
								color="text.secondary"
								sx={{
									fontSize: { xs: "0.75rem", sm: "0.875rem" },
									wordBreak: "break-word",
								}}
							>
								{revision.description || "No description"}
							</Typography>
							<Typography
								variant="caption"
								color="text.secondary"
								sx={{
									mt: 0.5,
									display: "block",
									fontSize: { xs: "0.688rem", sm: "0.75rem" },
								}}
							>
								{moment(revision.createdAt).format("YYYY-MM-DD HH:mm:ss")}
							</Typography>
						</Box>
					}
					primaryTypographyProps={{ component: "div" }}
					secondaryTypographyProps={{ component: "div" }}
				/>
			</ListItemButton>
		</ListItem>
	);
}

export default RevisionListItem;
