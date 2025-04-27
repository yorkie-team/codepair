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

interface SpeechToTextSetting {
	enable: boolean;
}

export interface FeatureSettingState {
	yorkieIntelligence: YorkieIntelligenceSetting | null;
	fileUpload: FileUploadSetting | null;
	speechToText: SpeechToTextSetting | null;
}

const initialState: FeatureSettingState = {
	yorkieIntelligence: null,
	fileUpload: null,
	speechToText: null,
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
		setSpeechToText: (state, action: PayloadAction<SpeechToTextSetting>) => {
			state.speechToText = action.payload;
		},
	},
});

export const { setYorkieIntelligence, setFileUpload, setSpeechToText } =
	featureSettingSlice.actions;

export const selectFeatureSetting = (state: RootState) => state.featureSetting;

/**
 *  Manages settings for specific features (e.g., experimental feature toggles).
 *
 *  * This slice handles:
 * - `yorkieIntelligence`: Settings for the Yorkie Intelligence feature
 * - `fileUpload`: Settings for file upload functionality
 * - `speechToText`: Settings for speech-to-text functionality
 */
const reducer = featureSettingSlice.reducer;

export default reducer;
