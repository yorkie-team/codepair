import { Body, Controller, Get, Param, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { IntelligenceService } from "./intelligence.service";
import { AuthroizedRequest } from "src/utils/types/req.type";
import { Feature } from "./types/feature.type";
import { RunFeatureDto } from "./dto/run-feature.dto";

@ApiTags("Intelligences")
@ApiBearerAuth()
@Controller("intelligence")
export class IntelligenceController {
	constructor(private intelligenceService: IntelligenceService) {}

	@Get(":feature")
	@ApiOperation({
		summary: "Run the Yorkie Intelligence Feature",
		description: "Run the selected yorkie intelligence",
	})
	@ApiParam({
		name: "feature",
		description: "Feature of intelligence to run",
		enum: Feature,
	})
	@ApiOkResponse({ type: String })
	async runFeature(
		@Req() req: AuthroizedRequest,
		@Param("feature") feature: Feature,
		@Body() runFeatureDto: RunFeatureDto
	): Promise<string> {
		await this.intelligenceService.runFeature(feature, runFeatureDto.content);
		return "Test";
	}
}
