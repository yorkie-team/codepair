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

export interface SettingState {
	yorkieIntelligence: YorkieIntelligenceSetting | null;
	fileUpload: FileUploadSetting | null;
}

const initialState: SettingState = {
	yorkieIntelligence: null,
	fileUpload: null,
};

export const settingSlice = createSlice({
	name: "setting",
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

export const { setYorkieIntelligence, setFileUpload } = settingSlice.actions;

export const selectSetting = (state: RootState) => state.setting;

export default settingSlice.reducer;
