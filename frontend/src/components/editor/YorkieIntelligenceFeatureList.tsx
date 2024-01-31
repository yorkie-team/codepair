import { ListItemIcon, ListItemText, MenuItem, MenuList, Stack, TextField } from "@mui/material";
import { useMemo, useState } from "react";
import GitHubIcon from "@mui/icons-material/GitHub";
import { matchSorter } from "match-sorter";
import { IntelligenceFeature } from "../../constants/intelligence";

const featureInfoList = [
	{
		title: "Write GitHub Issue",
		icon: <GitHubIcon />,
		feature: IntelligenceFeature.GITHUB_ISSUE,
	},
	{
		title: "Write GitHub Pull Request",
		icon: <GitHubIcon />,
		feature: IntelligenceFeature.GITHUB_PR,
	},
];

interface YorkieIntelligenceFeatureListProps {
	onSelectFeature: (feature: IntelligenceFeature, title: string) => void;
}

function YorkieIntelligenceFeatureList(props: YorkieIntelligenceFeatureListProps) {
	const { onSelectFeature } = props;
	const [featureText, setFeatureText] = useState("");
	const filteredFeatureInfoList = useMemo(() => {
		return matchSorter(featureInfoList, featureText, { keys: ["title", "feature"] });
	}, [featureText]);

	const handleFeatureTextChange: React.ChangeEventHandler<
		HTMLInputElement | HTMLTextAreaElement
	> = (e) => {
		setFeatureText(e.target.value);
	};

	return (
		<Stack>
			<TextField
				placeholder="Choose from below"
				size="small"
				sx={{
					width: 1,
				}}
				value={featureText}
				onChange={handleFeatureTextChange}
			/>
			<MenuList>
				{filteredFeatureInfoList.map((featureInfo) => (
					<MenuItem key={featureInfo.feature} onClick={() => onSelectFeature(featureInfo.feature, featureInfo.title)}>
						<ListItemIcon>{featureInfo.icon}</ListItemIcon>
						<ListItemText>{featureInfo.title}</ListItemText>
					</MenuItem>
				))}
			</MenuList>
		</Stack>
	);
}

export default YorkieIntelligenceFeatureList;
