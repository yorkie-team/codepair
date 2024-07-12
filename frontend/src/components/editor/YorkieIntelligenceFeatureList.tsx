import {
	Icon,
	ListItemIcon,
	ListItemText,
	MenuItem,
	MenuList,
	Stack,
	TextField,
} from "@mui/material";
import { useMemo, useState } from "react";
import { matchSorter } from "match-sorter";
import { selectSetting } from "../../store/settingSlice";
import { useSelector } from "react-redux";

interface YorkieIntelligenceFeatureListProps {
	onSelectFeature: (feature: string, title: string) => void;
}

function YorkieIntelligenceFeatureList(props: YorkieIntelligenceFeatureListProps) {
	const { onSelectFeature } = props;
	const settingStore = useSelector(selectSetting);
	const [featureText, setFeatureText] = useState("");
	const filteredFeatureInfoList = useMemo(() => {
		return matchSorter(settingStore.yorkieIntelligence?.config.features ?? [], featureText, {
			keys: ["title", "feature"],
		});
	}, [featureText, settingStore.yorkieIntelligence?.config.features]);

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
					<MenuItem
						key={featureInfo.feature}
						onClick={() => onSelectFeature(featureInfo.feature, featureInfo.title)}
					>
						<ListItemIcon>
							<Icon>
								<img src={featureInfo.icon} alt={featureInfo.title} />
							</Icon>
						</ListItemIcon>
						<ListItemText>{featureInfo.title}</ListItemText>
					</MenuItem>
				))}
			</MenuList>
		</Stack>
	);
}

export default YorkieIntelligenceFeatureList;
