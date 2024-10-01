import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

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

export default featureSettingSlice.reducer;
