class YorkieIntelligenceSetting {
	enable: boolean;
	config: {
		features: Array<{
			title: string;
			icon: string;
			feature: string;
		}>;
	};
}

class FileUploadSetting {
	enable: boolean;
}

export class GetSettingsResponse {
	yorkieIntelligence: YorkieIntelligenceSetting;

	fileUpload: FileUploadSetting;
}
