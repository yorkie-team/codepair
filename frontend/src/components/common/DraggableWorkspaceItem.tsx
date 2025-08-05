import {
	ListItemText,
	MenuItem,
	IconButton,
	Box,
	ListItemSecondaryAction,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import CheckIcon from "@mui/icons-material/Check";
import { forwardRef } from "react";
import { Workspace } from "../../hooks/api/types/workspace";

interface DraggableWorkspaceItemProps {
	workspace: Workspace;
	isSelected: boolean;
	isDragging: boolean;
	isDraggedItem: boolean;
	onSelect: (slug: string) => void;
	onPointerDown: (event: React.PointerEvent) => void;
	onPointerMove: (event: React.PointerEvent) => void;
	onPointerUp: (event: React.PointerEvent) => void;
}

const DraggableWorkspaceItem = forwardRef<HTMLLIElement, DraggableWorkspaceItemProps>(
	(
		{
			workspace,
			isSelected,
			isDragging,
			isDraggedItem,
			onSelect,
			onPointerDown,
			onPointerMove,
			onPointerUp,
		},
		ref
	) => {
		const theme = useTheme();
		const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

		return (
			<MenuItem
				ref={ref}
				onClick={() => onSelect(workspace.slug)}
				onPointerMove={onPointerMove}
				onPointerUp={onPointerUp}
				sx={{
					position: "relative",
					opacity: isDragging && !isDraggedItem ? 0.6 : 1,
					backgroundColor: isDraggedItem ? "action.selected" : "transparent",
					transform: isDraggedItem ? "scale(1.02)" : "scale(1)",
					boxShadow: isDraggedItem ? 2 : 0,
					transition: isDraggedItem ? "none" : "all 0.2s ease",
					cursor: isDragging ? "grabbing" : "pointer",
					"&:hover .drag-handle": {
						opacity: 1,
					},
					"&:hover": {
						backgroundColor: isDraggedItem ? "action.selected" : "action.hover",
					},
				}}
			>
				{!isMobile && (
					<Box
						sx={{
							position: "absolute",
							left: 8,
							top: "50%",
							transform: "translateY(-50%)",
							zIndex: 1,
						}}
					>
						<IconButton
							className="drag-handle"
							size="small"
							onPointerDown={onPointerDown}
							aria-label="Drag handle"
							sx={{
								opacity: 0.3,
								transition: "opacity 0.2s",
								cursor: "grab",
								padding: "4px",
								"&:active": {
									cursor: "grabbing",
								},
								"&:hover": {
									opacity: 0.7,
									backgroundColor: "action.hover",
								},
							}}
						>
							<DragIndicatorIcon fontSize="small" />
						</IconButton>
					</Box>
				)}

				<ListItemText
					sx={{
						pl: isMobile ? 2 : 5,
						pr: isSelected ? 5 : 1,
					}}
					primaryTypographyProps={{
						noWrap: true,
						variant: "body2",
						fontWeight: isSelected ? "medium" : "normal",
					}}
				>
					{workspace.title}
				</ListItemText>

				{isSelected && (
					<ListItemSecondaryAction>
						<CheckIcon fontSize="small" color="primary" />
					</ListItemSecondaryAction>
				)}
			</MenuItem>
		);
	}
);

DraggableWorkspaceItem.displayName = "DraggableWorkspaceItem";

export default DraggableWorkspaceItem;
