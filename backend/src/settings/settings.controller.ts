import { Controller, Get } from "@nestjs/common";
import { SettingsService } from "./settings.service";
import { ApiBearerAuth, ApiFoundResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { GetSettingsResponse } from "./types/get-settings-response.type";

@ApiTags("Settings")
@ApiBearerAuth()
@Controller("settings")
export class SettingsController {
	constructor(private settingsService: SettingsService) {}

	@Get()
	@ApiOperation({
		summary: "Get Settings",
		description: "Get Settings of CodePair",
	})
	@ApiFoundResponse({ type: GetSettingsResponse })
	async getSettings(): Promise<GetSettingsResponse> {
		return this.settingsService.getSettings();
	}
}
