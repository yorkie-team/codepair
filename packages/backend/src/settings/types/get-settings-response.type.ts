import { ApiProperty } from "@nestjs/swagger";

class YorkieIntelligenceConfig {
	@ApiProperty({ type: Boolean, description: "Enable Yorkie Intelligence" })
	enable: boolean;

	@ApiProperty({ type: Object, description: "Yorkie Intelligence Config" })
	config: {
		features: Array<{
			title: string;
			icon: string;
			feature: string;
		}>;
	};
}

class FileUploadConfig {
	@ApiProperty({ type: Boolean, description: "Enable File Upload" })
	enable: boolean;
}

export class GetSettingsResponse {
	@ApiProperty({ type: YorkieIntelligenceConfig, description: "Yorkie Intelligence Config" })
	yorkieIntelligence: YorkieIntelligenceConfig;

	@ApiProperty({ type: FileUploadConfig, description: "File Upload Config" })
	fileUpload: FileUploadConfig;
}
