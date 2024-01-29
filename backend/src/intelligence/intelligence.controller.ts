import { Body, Controller, Get, Param, Post, Req, Res } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { IntelligenceService } from "./intelligence.service";
import { AuthroizedRequest } from "src/utils/types/req.type";
import { Feature } from "./types/feature.type";
import { RunFeatureDto } from "./dto/run-feature.dto";
import { Response } from "express";

@ApiTags("Intelligences")
@ApiBearerAuth()
@Controller("intelligence")
export class IntelligenceController {
	constructor(private intelligenceService: IntelligenceService) {}

	@Post(":feature")
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
		@Res() res: Response,
		@Param("feature") feature: Feature,
		@Body() runFeatureDto: RunFeatureDto
	): Promise<void> {
		const stream = await this.intelligenceService.runFeature(
			req.user.id,
			feature,
			runFeatureDto.content
		);

		for await (const chunk of stream) {
			res.write(chunk);
		}

		res.end();
	}
}
