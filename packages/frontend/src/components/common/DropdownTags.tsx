import { useEffect, useState } from "react";
import {
	Box,
	OutlinedInput,
	InputLabel,
	MenuItem,
	FormControl,
	ListItemText,
	Select,
	Checkbox,
	SelectChangeEvent,
} from "@mui/material";
import { ALL_TAGS, TAGS, TagChip } from "@codepair/ui";
import type { TagType } from "@codepair/ui";

const ITEM_HEIGHT = 52;
const ITEM_PADDING_TOP = 4;
const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: ITEM_HEIGHT * 6 + ITEM_PADDING_TOP,
			width: 360,
		},
	},
};

function ColorDot({ color }: { color: string }) {
	return (
		<Box
			sx={{
				width: 14,
				height: 14,
				borderRadius: "50%",
				bgcolor: color,
				border: "1px solid",
				borderColor: "divider",
				flexShrink: 0,
			}}
		/>
	);
}

export type LabelDropdownProps = {
	options?: TagType[];
	label?: string;
	value?: TagType[];
	onChange?: (v: TagType[]) => void;
	fullWidth?: boolean;
};

export default function DropdownTags({
	options = ALL_TAGS,
	label = "Add tags...",
	value,
	onChange,
	fullWidth = false,
}: LabelDropdownProps) {
	const [selectedTags, setSelectedTags] = useState<TagType[]>(value ?? []);

	useEffect(() => {
		if (value !== undefined) {
			setSelectedTags(value);
		}
	}, [value]);

	const handleChange = (event: SelectChangeEvent<TagType[]>) => {
		const newSelected = event.target.value as TagType[];
		setSelectedTags(newSelected);
		onChange?.(newSelected);
	};

	return (
		<FormControl size="small" sx={{ m: 1, width: 200 }} fullWidth={fullWidth}>
			<InputLabel id="tags-multiple-checkbox-label" sx={{ color: "white" }}>
				{label}
			</InputLabel>
			<Select
				labelId="tags-multiple-checkbox-label"
				id="tags-multiple-checkbox"
				multiple
				value={selectedTags}
				onChange={handleChange}
				input={<OutlinedInput label={label} />}
				MenuProps={MenuProps}
				sx={{
					".MuiOutlinedInput-notchedOutline": {
						borderColor: "white",
					},
					"&:hover .MuiOutlinedInput-notchedOutline": {
						borderColor: "white",
					},
					".MuiSvgIcon-root": {
						color: "white",
					},
				}}
				renderValue={(selected) => {
					if (selected.length === 0) {
						return <Box sx={{ color: "text.disabled" }}>{label}</Box>;
					}
					return (
						<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
							{selected.map((tag) => (
								<TagChip key={tag} name={tag} size="small" />
							))}
						</Box>
					);
				}}
			>
				{options.map((tag) => {
					const isChecked = selectedTags.includes(tag);
					const meta = TAGS[tag];

					return (
						<MenuItem key={tag} value={tag} sx={{ py: 1.25 }}>
							<Checkbox checked={isChecked} sx={{ mr: 1, p: 0 }} />
							<Box sx={{ mr: 1.5, mt: "2px" }}>
								<ColorDot color={meta.bg} />
							</Box>
							<ListItemText
								primary={tag}
								secondary={meta.description}
								primaryTypographyProps={{ fontWeight: 600 }}
								secondaryTypographyProps={{
									variant: "body2",
									color: "text.secondary",
								}}
							/>
						</MenuItem>
					);
				})}
			</Select>
		</FormControl>
	);
}
