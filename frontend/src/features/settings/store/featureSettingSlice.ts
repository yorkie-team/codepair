import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../store/store";

interface YorkieIntelligenceSetting {
	enable: boolean;
	config: {
		features: Array<{
			title: string;
			icon: string;
			feature: string;
		}>;
	};
}

interface FileUploadSetting {
	enable: boolean;
}

export interface FeatureSettingState {
	yorkieIntelligence: YorkieIntelligenceSetting | null;
	fileUpload: FileUploadSetting | null;
}

const initialState: FeatureSettingState = {
	yorkieIntelligence: null,
	fileUpload: null,
};

export const featureSettingSlice = createSlice({
	name: "featureSetting",
	initialState,
	reducers: {
		setYorkieIntelligence: (state, action: PayloadAction<YorkieIntelligenceSetting>) => {
			state.yorkieIntelligence = action.payload;
		},
		setFileUpload: (state, action: PayloadAction<FileUploadSetting>) => {
			state.fileUpload = action.payload;
		},
	},
});

export const { setYorkieIntelligence, setFileUpload } = featureSettingSlice.actions;

export const selectFeatureSetting = (state: RootState) => state.featureSetting;

/**
 *  Manages settings for specific features (e.g., experimental feature toggles).
 *
 *  * This slice handles:
 * - `yorkieIntelligence`: Settings for the Yorkie Intelligence feature
 * - `fileUpload`: Settings for file upload functionality
 */
const reducer = featureSettingSlice.reducer;

export default reducer;
