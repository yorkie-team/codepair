import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { generateFeatureList } from "src/utils/constants/yorkie-intelligence";
import { GetSettingsResponse } from "./types/get-settings-response.type";

@Injectable()
export class SettingsService {
	constructor(private configService: ConfigService) {}

	async getSettings(): Promise<GetSettingsResponse> {
		return {
			yorkieIntelligence: {
				enable: this.configService.get("YORKIE_INTELLIGENCE") !== "false",
				config: {
					features: generateFeatureList(this.configService),
				},
			},
			fileUpload: {
				enable: this.configService.get("FILE_UPLOAD") === "true",
			},
		};
	}
}
