import { Chip, ChipProps } from "@mui/material";
import { TAGS, TagType } from "../../constants/tag";

export type TagChipProps = Omit<ChipProps, "label" | "color"> & {
	name: TagType;
};

export default function TagChip({
	name,
	variant = "filled",
	size = "small",
	...rest
}: TagChipProps) {
	const meta = TAGS[name];
	if (!meta) return null;

	const bg = meta.bg;
	const fg = meta.fg;

	const chip = (
		<Chip
			size={size}
			label={name}
			variant={variant}
			sx={{
				bgcolor: bg,
				color: fg,
				fontWeight: "bold",
			}}
			{...rest}
		/>
	);

	return chip;
}
